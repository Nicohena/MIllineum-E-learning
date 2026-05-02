<?php
require_once __DIR__ . '/Config/Config.php';
require_once __DIR__ . '/Core/Database.php';

use Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    $sql = "CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (sender_id),
        INDEX (receiver_id)
    );
    
    CREATE TABLE IF NOT EXISTS group_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (class_id),
        INDEX (sender_id)
    );";
    
    $db->exec($sql);
    echo "Messages table created successfully\n";
} catch (Exception $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
}
