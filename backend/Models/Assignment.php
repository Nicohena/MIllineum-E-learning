<?php

namespace Models;

use Core\Database;
use PDO;

class Assignment {
    private $db;
    private $table = 'class_assignments';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Create a new assignment
     * @param int $classId
     * @param int $subjectId
     * @param int $teacherId
     * @param int $yearId
     * @return bool
     */
    public function create($classId, $subjectId, $teacherId, $yearId) {
        $sql = "INSERT INTO " . $this->table . " (class_id, subject_id, teacher_id, academic_year_id) 
                VALUES (:class_id, :subject_id, :teacher_id, :year_id)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'class_id' => $classId,
            'subject_id' => $subjectId,
            'teacher_id' => $teacherId,
            'year_id' => $yearId
        ]);
    }

    /**
     * Get all assignments for a specific class and year
     */
    public function getByClass($classId, $yearId) {
        $sql = "SELECT ca.*, s.name as subject_name, u.name as teacher_name 
                FROM " . $this->table . " ca
                JOIN subjects s ON ca.subject_id = s.id
                JOIN users u ON ca.teacher_id = u.id
                WHERE ca.class_id = :class_id AND ca.academic_year_id = :year_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'class_id' => $classId,
            'year_id' => $yearId
        ]);
        return $stmt->fetchAll();
    }

    /**
     * Get all class assignments with class, subject, teacher, and year context.
     */
    public function getAll() {
        $sql = "SELECT ca.id, ca.class_id, ca.subject_id, ca.teacher_id, ca.academic_year_id, ca.created_at,
                       c.name AS class_name, s.name AS subject_name, u.name AS teacher_name, ay.name AS academic_year_name
                FROM " . $this->table . " ca
                JOIN classes c ON ca.class_id = c.id
                JOIN subjects s ON ca.subject_id = s.id
                JOIN users u ON ca.teacher_id = u.id
                JOIN academic_years ay ON ca.academic_year_id = ay.id
                ORDER BY ca.created_at DESC";

        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Check if a class has active-year teacher assignments.
     */
    public function hasActiveForClass($classId, $yearId) {
        $sql = "SELECT COUNT(*) FROM " . $this->table . " WHERE class_id = :class_id AND academic_year_id = :year_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'class_id' => $classId,
            'year_id' => $yearId
        ]);

        return (int) $stmt->fetchColumn() > 0;
    }

    /**
     * Check if a subject has active-year teacher assignments.
     */
    public function hasActiveForSubject($subjectId, $yearId) {
        $sql = "SELECT COUNT(*) FROM " . $this->table . " WHERE subject_id = :subject_id AND academic_year_id = :year_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'subject_id' => $subjectId,
            'year_id' => $yearId
        ]);

        return (int) $stmt->fetchColumn() > 0;
    }
}
