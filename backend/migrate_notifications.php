<?php
require_once __DIR__ . '/Config/Config.php';
require_once __DIR__ . '/Core/Database.php';

use Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    $sql = "
    CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'message', 'forum_reply', 'assignment_graded', etc.
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        link VARCHAR(255), -- Link to the relevant page (e.g., /student/messages?id=123)
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    ";
    
    $db->exec($sql);
    echo "Notifications table created successfully\n";
} catch (Exception $e) {
    echo "Error creating notifications table: " . $e->getMessage() . "\n";
}
