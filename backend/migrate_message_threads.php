<?php
require_once __DIR__ . '/Config/Config.php';
require_once __DIR__ . '/Core/Database.php';

use Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    // Add parent_id to messages for threading
    $sql = "ALTER TABLE messages ADD COLUMN parent_id INT DEFAULT NULL, ADD CONSTRAINT fk_message_parent FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE CASCADE";
    $db->exec($sql);
    
    // Add parent_id to group_messages for threading
    $sql = "ALTER TABLE group_messages ADD COLUMN parent_id INT DEFAULT NULL, ADD CONSTRAINT fk_group_message_parent FOREIGN KEY (parent_id) REFERENCES group_messages(id) ON DELETE CASCADE";
    $db->exec($sql);
    
    echo "Message thread columns added successfully\n";
} catch (Exception $e) {
    echo "Error updating tables: " . $e->getMessage() . "\n";
}
