<?php

namespace Models;

use Core\Database;
use PDO;

class User {
    private $db;
    private $table = 'users';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    private function normalizeGrade($grade) {
        if ($grade === null || $grade === '') {
            return null;
        }

        if (preg_match('/(9|10|11|12)/', (string) $grade, $matches)) {
            return 'Grade ' . $matches[1];
        }

        return null;
    }

    private function buildStudentIdentifier($user) {
        if (($user['role'] ?? null) !== 'student') {
            return null;
        }

        $normalizedGrade = $this->normalizeGrade($user['grade'] ?? null);
        if (!$normalizedGrade || empty($user['id'])) {
            return null;
        }

        $gradeNumber = preg_replace('/\D+/', '', $normalizedGrade);
        return sprintf('STU-G%s-%04d', $gradeNumber, (int) $user['id']);
    }

    private function appendDerivedFields($user) {
        if (!$user) {
            return $user;
        }

        if (($user['role'] ?? null) === 'student') {
            $user['grade'] = $this->normalizeGrade($user['grade'] ?? null) ?? $user['grade'];
            $user['student_identifier'] = $user['student_identifier'] ?? $this->buildStudentIdentifier($user);
        }

        return $user;
    }

    /**
     * Find a user by their email address
     * @param string $email
     * @return array|false User data or false if not found
     */
    public function findByEmail($email) {
        $sql = "SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        return $this->appendDerivedFields($stmt->fetch());
    }

    /**
     * Find a student by student identifier.
     * @param string $studentIdentifier
     * @return array|false
     */
    public function findByStudentIdentifier($studentIdentifier) {
        $sql = "SELECT * FROM " . $this->table . " WHERE student_identifier = :student_identifier LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':student_identifier', $studentIdentifier);
        $stmt->execute();

        return $this->appendDerivedFields($stmt->fetch());
    }

    /**
     * Get user by ID (excluding sensitive data)
     * @param int $id
     * @return array|false
     */
    public function findById($id) {
        $sql = "SELECT u.id, u.name, u.email, u.role, u.profile_image, u.grade, u.student_identifier, u.teaching_subject, u.class_id, c.name as class_name, u.created_at 
                FROM " . $this->table . " u
                LEFT JOIN classes c ON u.class_id = c.id
                WHERE u.id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $this->appendDerivedFields($stmt->fetch());
    }

    /**
     * Create a new user
     * @param array $data
     * @return bool|int New user ID or false
     */
    public function create($data) {
        $normalizedGrade = $this->normalizeGrade($data['grade'] ?? null);
        $sql = "INSERT INTO " . $this->table . " (name, email, password_hash, role, grade, student_identifier, teaching_subject, class_id) 
                VALUES (:name, :email, :password_hash, :role, :grade, :student_identifier, :teaching_subject, :class_id)";
        
        $stmt = $this->db->prepare($sql);
        $studentIdentifier = null;
        
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password_hash', $data['password_hash']);
        $stmt->bindParam(':role', $data['role']);
        $stmt->bindParam(':grade', $normalizedGrade);
        $stmt->bindParam(':student_identifier', $studentIdentifier);
        $stmt->bindParam(':teaching_subject', $data['teaching_subject']);
        $stmt->bindParam(':class_id', $data['class_id']);
        
        if ($stmt->execute()) {
            $newUserId = (int) $this->db->lastInsertId();

            if (($data['role'] ?? null) === 'student' && $normalizedGrade) {
                $studentIdentifier = $this->buildStudentIdentifier([
                    'id' => $newUserId,
                    'role' => 'student',
                    'grade' => $normalizedGrade,
                ]);

                $updateStmt = $this->db->prepare(
                    "UPDATE " . $this->table . " SET student_identifier = :student_identifier WHERE id = :user_id"
                );
                $updateStmt->execute([
                    'student_identifier' => $studentIdentifier,
                    'user_id' => $newUserId,
                ]);
            }

            return $newUserId;
        }
        
        return false;
    }

    /**
     * Get all users with optional role filtering.
     * Password hashes are never returned.
     */
    public function getAll($role = null, $search = null, $page = null, $perPage = null) {
        $sql = "SELECT u.id, u.name, u.email, u.role, u.status, u.profile_image, u.grade, u.student_identifier, u.teaching_subject, u.class_id,
                       c.name AS class_name, u.created_at, u.updated_at
                FROM " . $this->table . " u
                LEFT JOIN classes c ON u.class_id = c.id";

        $params = [];
        $where = [];

        if ($role) {
            $where[] = "u.role = :role";
            $params['role'] = $role;
        }

        if ($search) {
            $where[] = "(u.name LIKE :search OR u.email LIKE :search OR u.student_identifier LIKE :search OR c.name LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }

        $sql .= " ORDER BY u.created_at DESC";

        if ($page !== null && $perPage !== null) {
            $offset = max(0, ((int) $page - 1) * (int) $perPage);
            $limit = max(1, (int) $perPage);
            $sql .= " LIMIT " . $limit . " OFFSET " . $offset;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll();
        return array_map([$this, 'appendDerivedFields'], $users);
    }

    /**
     * Count users with optional role/search filters.
     */
    public function countAll($role = null, $search = null) {
        $sql = "SELECT COUNT(*) FROM " . $this->table . " u LEFT JOIN classes c ON u.class_id = c.id";
        $params = [];
        $where = [];

        if ($role) {
            $where[] = "u.role = :role";
            $params['role'] = $role;
        }

        if ($search) {
            $where[] = "(u.name LIKE :search OR u.email LIKE :search OR u.student_identifier LIKE :search OR c.name LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    /**
     * Aggregate user counts by role.
     */
    public function getRoleCounts() {
        $stmt = $this->db->query("
            SELECT
                COUNT(*) AS total_users,
                SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS total_students,
                SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) AS total_teachers,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS total_admins
            FROM " . $this->table
        );

        return $stmt->fetch();
    }

    /**
     * Assign a user to a specific class
     */
    public function assignToClass($userId, $classId) {
        $sql = "UPDATE " . $this->table . " SET class_id = :class_id WHERE id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'class_id' => $classId,
            'user_id' => $userId
        ]);
    }

    /**
     * Enroll a student in a class for a specific academic year
     */
    public function enrollInYear($studentId, $classId, $yearId) {
        $sql = "INSERT INTO student_enrollments (student_id, class_id, academic_year_id) 
                VALUES (:student_id, :class_id, :year_id)
                ON DUPLICATE KEY UPDATE class_id = VALUES(class_id)";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'student_id' => $studentId,
            'class_id' => $classId,
            'year_id' => $yearId
        ]);
    }

    /**
     * Update user status (active, suspended, inactive)
     */
    public function updateStatus($userId, $status) {
        $sql = "UPDATE " . $this->table . " SET status = :status WHERE id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'status' => $status,
            'user_id' => $userId
        ]);
    }

    /**
     * Reset a user's password hash.
     */
    public function updatePassword($userId, $passwordHash) {
        $sql = "UPDATE " . $this->table . " SET password_hash = :password_hash WHERE id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'password_hash' => $passwordHash,
            'user_id' => $userId
        ]);
    }

    /**
     * Update a teacher specialization subject.
     */
    public function updateTeachingSubject($userId, $subjectName) {
        $sql = "UPDATE " . $this->table . " SET teaching_subject = :subject_name WHERE id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'subject_name' => $subjectName,
            'user_id' => $userId
        ]);
    }

    /**
     * Clear teacher specialization subject.
     */
    public function clearTeachingSubject($userId) {
        $sql = "UPDATE " . $this->table . " SET teaching_subject = NULL WHERE id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'user_id' => $userId
        ]);
    }

    /**
     * Delete a user
     */
    public function delete($userId) {
        $sql = "DELETE FROM " . $this->table . " WHERE id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['user_id' => $userId]);
    }
}
