<?php

namespace Models;

use Core\Database;
use PDO;

class AcademicYear {
    private $db;
    private $table = 'academic_years';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get the currently active academic year
     */
    public function getActiveYear() {
        $sql = "SELECT * FROM " . $this->table . " WHERE is_active = TRUE LIMIT 1";
        $stmt = $this->db->query($sql);
        return $stmt->fetch();
    }

    /**
     * Get all academic years
     */
    public function getAll() {
        $sql = "SELECT * FROM " . $this->table . " ORDER BY created_at DESC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Get academic year by ID.
     */
    public function findById($id) {
        $sql = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Create a new academic year
     */
    public function create($name) {
        $sql = "INSERT INTO " . $this->table . " (name) VALUES (:name)";
        $stmt = $this->db->prepare($sql);
        if ($stmt->execute(['name' => $name])) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    /**
     * Set a specific year as active and deactivate others
     */
    public function setActive($id) {
        try {
            $this->db->beginTransaction();

            $targetYear = $this->findById($id);
            if (!$targetYear) {
                $this->db->rollBack();
                return false;
            }
            
            // Deactivate all
            $sql1 = "UPDATE " . $this->table . " SET is_active = FALSE";
            $this->db->query($sql1);
            
            // Activate selected
            $sql2 = "UPDATE " . $this->table . " SET is_active = TRUE WHERE id = :id";
            $stmt2 = $this->db->prepare($sql2);
            $stmt2->execute(['id' => $id]);

            if ($stmt2->rowCount() !== 1) {
                $this->db->rollBack();
                return false;
            }
            
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            return false;
        }
    }

    /**
     * Count linked records referencing an academic year.
     */
    public function getLinkedUsageCounts($id) {
        $counts = [
            'class_assignments' => 0,
            'student_enrollments' => 0,
            'courses' => 0,
        ];

        $stmtAssignments = $this->db->prepare("SELECT COUNT(*) FROM class_assignments WHERE academic_year_id = :id");
        $stmtAssignments->execute(['id' => $id]);
        $counts['class_assignments'] = (int) $stmtAssignments->fetchColumn();

        $stmtEnrollments = $this->db->prepare("SELECT COUNT(*) FROM student_enrollments WHERE academic_year_id = :id");
        $stmtEnrollments->execute(['id' => $id]);
        $counts['student_enrollments'] = (int) $stmtEnrollments->fetchColumn();

        $stmtCourses = $this->db->prepare("SELECT COUNT(*) FROM courses WHERE academic_year_id = :id");
        $stmtCourses->execute(['id' => $id]);
        $counts['courses'] = (int) $stmtCourses->fetchColumn();

        return $counts;
    }

    /**
     * Delete an academic year by ID.
     */
    public function delete($id) {
        $sql = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() === 1;
    }
}
