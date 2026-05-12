<?php

require_once __DIR__ . '/Core/Database.php';

use Core\Database;

$db = Database::getInstance()->getConnection();

$db->exec("
    CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        teacher_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATETIME NOT NULL,
        time_limit_minutes INT DEFAULT 15,
        questions_json LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,

        INDEX idx_quizzes_course (course_id),
        INDEX idx_quizzes_teacher (teacher_id),
        INDEX idx_quizzes_due_date (due_date)
    ) ENGINE=InnoDB
");

$db->exec("
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        student_id INT NOT NULL,
        answers_json LONGTEXT NOT NULL,
        score INT DEFAULT 0,
        total_points INT DEFAULT 0,
        percentage DECIMAL(5,2) DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,

        UNIQUE KEY unique_quiz_attempt (quiz_id, student_id),
        INDEX idx_quiz_attempt_student (student_id)
    ) ENGINE=InnoDB
");

echo "Quiz tables are ready.\n";
