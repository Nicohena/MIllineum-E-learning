<?php
require_once __DIR__ . '/Config/Config.php';
require_once __DIR__ . '/Core/Database.php';

use Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    $sql = "
    CREATE TABLE IF NOT EXISTS forum_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS forum_threads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        author_id INT NOT NULL,
        course_id INT DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_locked BOOLEAN DEFAULT FALSE,
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS forum_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        thread_id INT NOT NULL,
        author_id INT NOT NULL,
        content TEXT NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Insert some default categories
    INSERT INTO forum_categories (name, description, icon) VALUES 
    ('General Discussion', 'General topics and school-wide news', 'MessageSquare'),
    ('Academic Help', 'Get help with your courses and assignments', 'BookOpen'),
    ('Technical Support', 'Issues with the e-learning platform', 'Settings'),
    ('Student Life', 'Clubs, events, and extracurriculars', 'Users');
    ";
    
    $db->exec($sql);
    echo "Forum tables created successfully\n";
} catch (Exception $e) {
    echo "Error creating forum tables: " . $e->getMessage() . "\n";
}
