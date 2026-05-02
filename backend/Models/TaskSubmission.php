<?php

namespace Models;

use Core\Database;
use PDO;

class TaskSubmission {
    private $db;
    private $table = 'task_submissions';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Submit an assignment (upsert)
     */
    public function submit($assignmentId, $studentId, $fileUrl, $notes = '') {
        $sql = "INSERT INTO {$this->table} (assignment_id, student_id, file_url, notes, status)
                VALUES (:assignment_id, :student_id, :file_url, :notes, 'submitted')
                ON DUPLICATE KEY UPDATE
                    file_url = VALUES(file_url),
                    notes = VALUES(notes),
                    status = 'submitted',
                    submitted_at = CURRENT_TIMESTAMP";
        $stmt = $this->db->prepare($sql);
        if ($stmt->execute([
            'assignment_id' => $assignmentId,
            'student_id'    => $studentId,
            'file_url'      => $fileUrl,
            'notes'         => $notes
        ])) {
            return $this->db->lastInsertId() ?: true;
        }
        return false;
    }

    /**
     * Get all submissions for a specific assignment (teacher view)
     */
    public function getByAssignment($assignmentId) {
        $sql = "SELECT ts.*, u.name AS student_name, u.email AS student_email
                FROM {$this->table} ts
                JOIN users u ON ts.student_id = u.id
                WHERE ts.assignment_id = :assignment_id
                ORDER BY ts.submitted_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['assignment_id' => $assignmentId]);
        return $stmt->fetchAll();
    }

    /**
     * Grade a submission
     */
    public function grade($submissionId, $grade, $feedback = '') {
        $sql = "UPDATE {$this->table}
                SET grade = :grade, feedback = :feedback, status = 'graded', graded_at = NOW()
                WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'grade'    => $grade,
            'feedback' => $feedback,
            'id'       => $submissionId
        ]);
    }

    /**
     * Get a single submission
     */
    public function findById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
}
