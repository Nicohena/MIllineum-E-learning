<?php

namespace Config;

class Config {
    /**
     * Get an environment variable with a fallback.
     */
    public static function get($key, $default = null) {
        if (isset($_ENV[$key])) return $_ENV[$key];
        if (isset($_SERVER[$key])) return $_SERVER[$key];
        $val = getenv($key);
        return $val !== false ? $val : $default;
    }

    // Secret key for JWT signing. 
    public static function jwtSecret() {
        return self::get('JWT_SECRET', '9e4b7c2a1f8d5e3a6b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4g3h2i1j0k9l8m');
    }
    
    // Token expiration time (e.g., 24 hours)
    public static function tokenExpiry() {
        return (int) self::get('TOKEN_EXPIRY', 86440);
    }

    // Upload Settings
    public static function uploadPath() {
        return __DIR__ . '/../Uploads/';
    }
    
    public static function maxFileSize() {
        return (int) self::get('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB
    }
    
    public static function allowedExtensions() {
        return ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'mp3', 'jpg', 'png'];
    }
}
