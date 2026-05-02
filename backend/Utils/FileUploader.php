<?php

namespace Utils;

use Config\Config;

class FileUploader {
    /**
     * Upload a file to Cloudinary and return the secure URL.
     * Falls back to local storage if Cloudinary is not configured.
     *
     * @param array  $file      The element from $_FILES
     * @param string $subFolder Optional Cloudinary folder (e.g. "course_1/chapter_2")
     * @return string|array  The Cloudinary secure_url on success, or ['error' => '...'] on failure
     */
    public static function upload($file, $subFolder = '') {
        // 1. Basic checks
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['error' => 'File upload failed or was interrupted.'];
        }

        // 2. Validate Size
        if ($file['size'] > Config::maxFileSize()) {
            return ['error' => 'File is too large. Max limit is 50MB.'];
        }

        // 3. Validate Extension
        $filename  = $file['name'];
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (!in_array($extension, Config::allowedExtensions())) {
            return ['error' => 'Unsupported file type. Allowed: ' . implode(', ', Config::allowedExtensions())];
        }

        // 4. Build a clean unique public_id for Cloudinary
        $safeBaseName = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($filename, PATHINFO_FILENAME));
        $publicId     = ($subFolder ? trim($subFolder, '/') . '/' : '') . uniqid() . '_' . $safeBaseName;

        // 5. Upload to Cloudinary
        $cloudName = Config::get('CLOUDINARY_CLOUD_NAME');
        if ($cloudName) {
            // Determine the Cloudinary folder (separate from public_id prefix)
            $folder = $subFolder ? trim($subFolder, '/') : '';
            $result = CloudinaryUploader::upload($file['tmp_name'], $folder);

            if (isset($result['error'])) {
                // If Cloudinary is misconfigured (cloud/region), gracefully fall back to local storage.
                $errorMessage = strtolower((string) $result['error']);
                $isCloudConfigError =
                    strpos($errorMessage, 'invalid cloudinary cloud name') !== false ||
                    strpos($errorMessage, 'invalid cloud_name') !== false ||
                    strpos($errorMessage, 'region endpoint') !== false;

                if (!$isCloudConfigError) {
                    return $result; // propagate non-configuration errors (e.g., signature/auth)
                }
            }

            // Return the full Cloudinary secure URL
            if (isset($result['secure_url'])) {
                return $result['secure_url'];
            }
        }

        // 6. Fallback: Save locally (original behaviour)
        $uploadBase   = Config::uploadPath();
        $targetFolder = $uploadBase . ($subFolder ? trim($subFolder, '/') . '/' : '');

        if (!is_dir($targetFolder)) {
            mkdir($targetFolder, 0777, true);
        }

        $safeName   = uniqid() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "_", $filename);
        $targetPath = $targetFolder . $safeName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return ($subFolder ? trim($subFolder, '/') . '/' : '') . $safeName;
        }

        return ['error' => 'Failed to move uploaded file to destination.'];
    }
}
