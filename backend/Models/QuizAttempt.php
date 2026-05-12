<?php

namespace Models;

use Core\Database;
use PDO;

class QuizAttempt {
    private $db;
    private $table = 'quiz_attempts';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function submit($quizId, $studentId, $answers, $score, $totalPoints) {
        $percentage = $totalPoints > 0 ? round(($score / $totalPoints) * 100, 2) : 0;
        $sql = "INSERT INTO {$this->table}
                    (quiz_id, student_id, answers_json, score, total_points, percentage)
                VALUES
                    (:quiz_id, :student_id, :answers_json, :score, :total_points, :percentage)
                ON DUPLICATE KEY UPDATE
                    answers_json = VALUES(answers_json),
                    score = VALUES(score),
                    total_points = VALUES(total_points),
                    percentage = VALUES(percentage),
                    submitted_at = CURRENT_TIMESTAMP";
        $stmt = $this->db->prepare($sql);

        if ($stmt->execute([
            'quiz_id' => $quizId,
            'student_id' => $studentId,
            'answers_json' => json_encode($answers),
            'score' => $score,
            'total_points' => $totalPoints,
            'percentage' => $percentage,
        ])) {
            return [
                'score' => $score,
                'total_points' => $totalPoints,
                'percentage' => $percentage,
            ];
        }

        return false;
    }

    public function findByQuizAndStudent($quizId, $studentId) {
        $sql = "SELECT * FROM {$this->table}
                WHERE quiz_id = :quiz_id AND student_id = :student_id
                LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['quiz_id' => $quizId, 'student_id' => $studentId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByQuiz($quizId) {
        $sql = "SELECT qa.*, u.name AS student_name, u.email AS student_email
                FROM {$this->table} qa
                JOIN users u ON qa.student_id = u.id
                WHERE qa.quiz_id = :quiz_id
                ORDER BY qa.submitted_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['quiz_id' => $quizId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
