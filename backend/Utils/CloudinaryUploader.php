<?php

namespace Utils;

/**
 * CloudinaryUploader
 * 
 * Uploads files to Cloudinary using the REST API (no SDK / Composer required).
 * Credentials are read from environment variables set by the .env loader in index.php.
 */
class CloudinaryUploader {

    /**
     * Resolve Cloudinary cloud name from common env keys and CLOUDINARY_URL.
     */
    private static function resolveCloudName() {
        $cloudName = \Config\Config::get('CLOUDINARY_CLOUD_NAME');
        if (!empty($cloudName)) {
            return $cloudName;
        }

        $cloudName = \Config\Config::get('CLOUDINARY_CLOUD');
        if (!empty($cloudName)) {
            return $cloudName;
        }

        $cloudinaryUrl = \Config\Config::get('CLOUDINARY_URL', '');
        if (!empty($cloudinaryUrl)) {
            $parts = parse_url($cloudinaryUrl);
            if (!empty($parts['host'])) {
                return $parts['host'];
            }
        }

        return '';
    }

    /**
     * Upload a file from a temp path to Cloudinary.
     *
     * @param string $tmpPath    The temporary file path (e.g. from $_FILES['file']['tmp_name'])
     * @param string $folder     Optional Cloudinary folder (e.g. "course_1/chapter_2")
     * @param string $publicId   Optional custom public ID (filename without extension)
     * @return array ['secure_url' => '...', 'public_id' => '...'] on success
     *               ['error' => '...'] on failure
     */
    public static function upload($tmpPath, $folder = '', $publicId = '') {
        $cloudName = self::resolveCloudName();
        $apiKey    = \Config\Config::get('CLOUDINARY_API_KEY');
        $apiSecret = \Config\Config::get('CLOUDINARY_API_SECRET');

        if (!$cloudName || !$apiKey || !$apiSecret) {
            return ['error' => 'Cloudinary credentials are not configured in .env'];
        }

        $timestamp = time();

        // Build signature params — must be sorted alphabetically
        $sigParams = ['timestamp' => $timestamp];
        if ($folder)   $sigParams['folder']    = $folder;
        if ($publicId) $sigParams['public_id'] = $publicId;

        ksort($sigParams);

        // Cloudinary expects signature params joined as raw key=value pairs (not URL-encoded).
        $pairs = [];
        foreach ($sigParams as $key => $value) {
            $pairs[] = $key . '=' . $value;
        }

        // Build signature string: "folder=x&public_id=y&timestamp=z{API_SECRET}"
        $sigString = implode('&', $pairs) . $apiSecret;
        $signature = sha1($sigString);

        // POST to Cloudinary auto-upload endpoint (handles PDF, images, video, etc.)
        // Some accounts are region-scoped and require api-eu/api-ap endpoints.
        $configuredPrefix = trim((string) \Config\Config::get('CLOUDINARY_UPLOAD_PREFIX', ''));
        $uploadPrefixes = [];
        if (!empty($configuredPrefix)) {
            $uploadPrefixes[] = rtrim($configuredPrefix, '/');
        } else {
            $uploadPrefixes = [
                'https://api.cloudinary.com',
                'https://api-eu.cloudinary.com',
                'https://api-ap.cloudinary.com'
            ];
        }

        $postFields = [
            'file'      => new \CURLFile($tmpPath),
            'api_key'   => $apiKey,
            'timestamp' => $timestamp,
            'signature' => $signature,
        ];

        if ($folder)   $postFields['folder']    = $folder;
        if ($publicId) $postFields['public_id'] = $publicId;

        $lastError = '';
        foreach ($uploadPrefixes as $prefix) {
            $uploadUrl = $prefix . "/v1_1/{$cloudName}/auto/upload";

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL            => $uploadUrl,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $postFields,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 120,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $lastError = 'cURL error during Cloudinary upload: ' . $curlError;
                continue;
            }

            $data = json_decode($response, true);
            if ($httpCode === 200 && !isset($data['error'])) {
                return [
                    'secure_url' => $data['secure_url'],
                    'public_id'  => $data['public_id'],
                ];
            }

            $msg = $data['error']['message'] ?? ('Cloudinary upload failed (HTTP ' . $httpCode . ')');
            $lastError = $msg;

            // Try next region endpoint when cloud is not found at current host.
            if (stripos($msg, 'Invalid cloud_name') !== false) {
                continue;
            }

            // For non-region errors (signature, auth, etc.), stop early.
            return ['error' => $msg];
        }

        if (stripos($lastError, 'Invalid cloud_name') !== false) {
            return [
                'error' => 'Invalid Cloudinary cloud name or region endpoint. Confirm CLOUDINARY_CLOUD_NAME and set CLOUDINARY_UPLOAD_PREFIX in backend/.env (e.g. https://api-eu.cloudinary.com or https://api-ap.cloudinary.com).'
            ];
        }

        return ['error' => $lastError ?: 'Cloudinary upload failed.'];
    }
}
