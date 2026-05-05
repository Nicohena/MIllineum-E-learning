<?php

require_once __DIR__ . '/Config/Config.php';
require_once __DIR__ . '/Core/Database.php';

use Core\Database;

function normalize_grade($grade) {
    if ($grade === null || $grade === '') {
        return null;
    }

    if (preg_match('/(9|10|11|12)/', (string) $grade, $matches)) {
        return 'Grade ' . $matches[1];
    }

    return null;
}

function build_student_identifier($grade, $id) {
    $normalizedGrade = normalize_grade($grade);
    if (!$normalizedGrade) {
        return null;
    }

    $gradeNumber = preg_replace('/\D+/', '', $normalizedGrade);
    return sprintf('STU-G%s-%04d', $gradeNumber, (int) $id);
}

try {
    $db = Database::getInstance()->getConnection();

    $db->exec("
        ALTER TABLE users
        ADD COLUMN student_identifier VARCHAR(50) DEFAULT NULL UNIQUE
    ");

    echo "Added student_identifier column.\n";
} catch (\PDOException $e) {
    if ((int) $e->errorInfo[1] !== 1060) {
        throw $e;
    }

    echo "student_identifier column already exists.\n";
}

try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("
        SELECT id, grade
        FROM users
        WHERE role = 'student'
    ");
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $updateStmt = $db->prepare("
        UPDATE users
        SET grade = :grade, student_identifier = :student_identifier
        WHERE id = :id
    ");

    $updated = 0;

    foreach ($students as $student) {
        $normalizedGrade = normalize_grade($student['grade']);
        $studentIdentifier = build_student_identifier($student['grade'], $student['id']);

        if (!$normalizedGrade || !$studentIdentifier) {
            continue;
        }

        $updateStmt->execute([
            'grade' => $normalizedGrade,
            'student_identifier' => $studentIdentifier,
            'id' => $student['id'],
        ]);
        $updated++;
    }

    echo "Backfilled {$updated} student records.\n";
} catch (\Throwable $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
