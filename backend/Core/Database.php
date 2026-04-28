<?php

namespace Core;

use PDO;
use PDOException;

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        // Load configuration from .env via Config
        $host = \Config\Config::get('DB_HOST', '127.0.0.1');
        $port = \Config\Config::get('DB_PORT', '3306');
        $db   = \Config\Config::get('DB_NAME', 'elearning');
        $user = \Config\Config::get('DB_USER', 'root');
        $pass = \Config\Config::get('DB_PASS', '');
        $charset = 'utf8mb4';

        // XAMPP use MySQL/MariaDB
        $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->connection = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            // In a real API, we would use a JSON response for errors
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }
}
