<?php

namespace Models;

use Core\Database;
use PDO;

class Quiz {
    private $db;
    private $table = 'quizzes';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($courseId, $teacherId, $title, $description, $dueDate, $timeLimitMinutes, $questions) {
        $sql = "INSERT INTO {$this->table}
                    (course_id, teacher_id, title, description, due_date, time_limit_minutes, questions_json)
                VALUES
                    (:course_id, :teacher_id, :title, :description, :due_date, :time_limit_minutes, :questions_json)";
        $stmt = $this->db->prepare($sql);

        if ($stmt->execute([
            'course_id' => $courseId,
            'teacher_id' => $teacherId,
            'title' => $title,
            'description' => $description,
            'due_date' => $dueDate,
            'time_limit_minutes' => $timeLimitMinutes,
            'questions_json' => json_encode($questions),
        ])) {
            return $this->db->lastInsertId();
        }

        return false;
    }

    public function getByTeacher($teacherId) {
        $sql = "SELECT q.id, q.course_id, q.teacher_id, q.title, q.description, q.due_date,
                       q.time_limit_minutes, q.created_at, c.title AS course_title,
                       cl.name AS class_name,
                       COUNT(qa.id) AS attempt_count,
                       COALESCE(AVG(qa.percentage), 0) AS average_score
                FROM {$this->table} q
                JOIN courses c ON q.course_id = c.id
                LEFT JOIN classes cl ON c.class_id = cl.id
                LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
                WHERE q.teacher_id = :teacher_id
                GROUP BY q.id
                ORDER BY q.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['teacher_id' => $teacherId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getForStudent($studentId) {
        $sql = "SELECT q.id, q.course_id, q.teacher_id, q.title, q.description, q.due_date,
                       q.time_limit_minutes, q.created_at, c.title AS course_title,
                       u.name AS teacher_name,
                       qa.id AS attempt_id, qa.score, qa.total_points, qa.percentage, qa.submitted_at
                FROM {$this->table} q
                JOIN courses c ON q.course_id = c.id
                JOIN users u ON q.teacher_id = u.id
                LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.student_id = :student_id
                WHERE c.class_id = (SELECT class_id FROM users WHERE id = :student_id2)
                ORDER BY q.due_date ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['student_id' => $studentId, 'student_id2' => $studentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id) {
        $sql = "SELECT q.*, c.class_id
                FROM {$this->table} q
                JOIN courses c ON q.course_id = c.id
                WHERE q.id = :id
                LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
