<?php

namespace Core;

use Config\Config;

class JwtHandler {
    private static $secret;

    private static function init() {
        self::$secret = Config::jwtSecret();
    }

    /**
     * Create a simple JWT token
     * @param array $payload
     * @return string
     */
    public static function createToken($payload) {
        self::init();

        $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
        
        // Add standard claims
        $payload['iat'] = time();
        $payload['exp'] = time() + Config::tokenExpiry();
        
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Validate and decode a JWT token
     * @param string $token
     * @return array|false
     */
    public static function validateToken($token) {
        self::init();

        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        list($header64, $payload64, $signature64) = $parts;

        // Verify Signature
        $signature = hash_hmac('sha256', $header64 . "." . $payload64, self::$secret, true);
        if (self::base64UrlEncode($signature) !== $signature64) return false;

        $payload = json_decode(self::base64UrlDecode($payload64), true);

        // Verify Expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) return false;

        return $payload;
    }

    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode($data) {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }
}
