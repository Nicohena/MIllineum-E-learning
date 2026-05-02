<?php

namespace Models;

use Core\Database;
use PDO;

class TaskAssignment {
    private $db;
    private $table = 'task_assignments';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Create a new task assignment
     */
    public function create($courseId, $teacherId, $title, $instructions, $dueDate, $points = 100, $attachmentUrl = null) {
        $sql = "INSERT INTO {$this->table} (course_id, teacher_id, title, instructions, due_date, points, attachment_url)
                VALUES (:course_id, :teacher_id, :title, :instructions, :due_date, :points, :attachment_url)";
        $stmt = $this->db->prepare($sql);
        if ($stmt->execute([
            'course_id'      => $courseId,
            'teacher_id'     => $teacherId,
            'title'          => $title,
            'instructions'   => $instructions,
            'due_date'       => $dueDate,
            'points'         => $points,
            'attachment_url' => $attachmentUrl
        ])) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    /**
     * Get all assignments for a course with submission count
     */
    public function getByCourse($courseId) {
        $sql = "SELECT ta.*,
                       COUNT(ts.id) AS submission_count
                FROM {$this->table} ta
                LEFT JOIN task_submissions ts ON ta.id = ts.assignment_id
                WHERE ta.course_id = :course_id
                GROUP BY ta.id
                ORDER BY ta.due_date ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetchAll();
    }

    /**
     * Get all assignments for the logged-in teacher
     */
    public function getByTeacher($teacherId) {
        $sql = "SELECT ta.*, c.title AS course_title, cl.name AS class_name,
                       COUNT(ts.id) AS submission_count
                FROM {$this->table} ta
                JOIN courses c ON ta.course_id = c.id
                LEFT JOIN classes cl ON c.class_id = cl.id
                LEFT JOIN task_submissions ts ON ta.id = ts.assignment_id
                WHERE ta.teacher_id = :teacher_id
                GROUP BY ta.id
                ORDER BY ta.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['teacher_id' => $teacherId]);
        return $stmt->fetchAll();
    }

    /**
     * Get all assignments for a student (based on their enrolled courses)
     */
    public function getForStudent($studentId) {
        $sql = "SELECT ta.*, c.title AS course_title, u.name AS teacher_name,
                       ts.id AS submission_id, ts.status AS submission_status,
                       ts.grade, ts.feedback, ts.submitted_at
                FROM {$this->table} ta
                JOIN courses c ON ta.course_id = c.id
                JOIN users u ON ta.teacher_id = u.id
                LEFT JOIN task_submissions ts ON ta.id = ts.assignment_id AND ts.student_id = :student_id
                WHERE c.class_id = (SELECT class_id FROM users WHERE id = :student_id2)
                ORDER BY ta.due_date ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['student_id' => $studentId, 'student_id2' => $studentId]);
        return $stmt->fetchAll();
    }

    /**
     * Get a single assignment by ID
     */
    public function findById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Delete an assignment
     */
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
