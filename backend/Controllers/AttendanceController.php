<?php

namespace Controllers;

use Core\Database;
use Core\JwtHandler;
use PDO;

class AttendanceController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Decode and validate the JWT token, returning payload or sending 401/403
     */
    private function auth($requiredRole = null) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (strpos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return false;
        }

        $token = substr($authHeader, 7);
        $decoded = JwtHandler::validateToken($token);

        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            return false;
        }

        if ($requiredRole && $decoded['role'] !== $requiredRole) {
            http_response_code(403);
            echo json_encode(['error' => "Forbidden: {$requiredRole} access only"]);
            return false;
        }

        return $decoded;
    }

    /**
     * Validate attendance input data
     */
    private function validateAttendanceData($data) {
        $errors = [];

        // Validate session_id
        if (!isset($data['session_id']) || !is_numeric($data['session_id'])) {
            $errors[] = 'Valid session_id is required';
        }

        // Validate student_id
        if (!isset($data['student_id']) || !is_numeric($data['student_id'])) {
            $errors[] = 'Valid student_id is required';
        }

        // Validate status
        $validStatuses = ['present', 'absent', 'late'];
        if (!isset($data['status']) || !in_array($data['status'], $validStatuses)) {
            $errors[] = 'Status must be one of: present, absent, late';
        }

        // Validate timestamp (optional, defaults to now)
        if (isset($data['timestamp']) && !strtotime($data['timestamp'])) {
            $errors[] = 'Invalid timestamp format';
        }

        return $errors;
    }

    /**
     * Mark attendance for a student (Teacher only)
     */
    public function markAttendance() {
        $user = $this->auth('teacher');
        if (!$user) return;

        $input = json_decode(file_get_contents('php://input'), true);

        // Validate input
        $validationErrors = $this->validateAttendanceData($input);
        if (!empty($validationErrors)) {
            http_response_code(400);
            echo json_encode(['error' => 'Validation failed', 'details' => $validationErrors]);
            return;
        }

        // Check if teacher has permission for this session
        if (!$this->verifyTeacherSessionAccess($user['id'], $input['session_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: You do not have access to this session']);
            return;
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO attendance (session_id, student_id, status, marked_by, timestamp)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                marked_by = VALUES(marked_by),
                timestamp = VALUES(timestamp)
            ");

            $timestamp = $input['timestamp'] ?? date('Y-m-d H:i:s');

            $stmt->execute([
                $input['session_id'],
                $input['student_id'],
                $input['status'],
                $user['id'],
                $timestamp
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Attendance marked successfully'
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to mark attendance']);
        }
    }

    /**
     * Get attendance for a session (Teacher/Admin only)
     */
    public function getSessionAttendance() {
        $user = $this->auth();
        if (!$user) return;

        $sessionId = $_GET['session_id'] ?? null;

        if (!$sessionId || !is_numeric($sessionId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid session_id is required']);
            return;
        }

        // Check permissions
        if ($user['role'] === 'teacher') {
            if (!$this->verifyTeacherSessionAccess($user['id'], $sessionId)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden: You do not have access to this session']);
                return;
            }
        } elseif ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Insufficient permissions']);
            return;
        }

        try {
            $stmt = $this->db->prepare("
                SELECT a.*, u.name as student_name, u.email as student_email
                FROM attendance a
                JOIN users u ON a.student_id = u.id
                WHERE a.session_id = ?
                ORDER BY u.name
            ");

            $stmt->execute([$sessionId]);
            $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'status' => 'success',
                'attendance' => $attendance
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve attendance']);
        }
    }

    /**
     * Get student's own attendance (Student only)
     */
    public function getMyAttendance() {
        $user = $this->auth('student');
        if (!$user) return;

        $courseId = $_GET['course_id'] ?? null;
        $month = $_GET['month'] ?? date('m');
        $year = $_GET['year'] ?? date('Y');

        // Validate month and year
        if (!is_numeric($month) || $month < 1 || $month > 12) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid month']);
            return;
        }

        if (!is_numeric($year) || $year < 2020 || $year > 2030) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid year']);
            return;
        }

        try {
            $query = "
                SELECT a.*, s.title as subject_title, DATE_FORMAT(a.timestamp, '%Y-%m-%d') as date
                FROM attendance a
                JOIN live_class_sessions lcs ON a.session_id = lcs.id
                JOIN subjects s ON lcs.subject_id = s.id
                WHERE a.student_id = ? AND MONTH(a.timestamp) = ? AND YEAR(a.timestamp) = ?
            ";

            $params = [$user['id'], $month, $year];

            if ($courseId) {
                if (!is_numeric($courseId)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid course_id']);
                    return;
                }
                $query .= " AND lcs.subject_id = ?";
                $params[] = $courseId;
            }

            $query .= " ORDER BY a.timestamp DESC";

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calculate statistics
            $total = count($attendance);
            $present = count(array_filter($attendance, fn($a) => $a['status'] === 'present'));
            $absent = count(array_filter($attendance, fn($a) => $a['status'] === 'absent'));
            $late = count(array_filter($attendance, fn($a) => $a['status'] === 'late'));

            echo json_encode([
                'status' => 'success',
                'attendance' => $attendance,
                'statistics' => [
                    'total' => $total,
                    'present' => $present,
                    'absent' => $absent,
                    'late' => $late,
                    'percentage' => $total > 0 ? round(($present / $total) * 100, 1) : 0
                ]
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve attendance']);
        }
    }

    /**
     * Bulk mark attendance for multiple students (Teacher only)
     */
    public function bulkMarkAttendance() {
        $user = $this->auth('teacher');
        if (!$user) return;

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['session_id']) || !is_numeric($input['session_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid session_id is required']);
            return;
        }

        if (!isset($input['attendance']) || !is_array($input['attendance'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Attendance data array is required']);
            return;
        }

        // Check teacher permission
        if (!$this->verifyTeacherSessionAccess($user['id'], $input['session_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: You do not have access to this session']);
            return;
        }

        $errors = [];
        $successCount = 0;

        try {
            $this->db->beginTransaction();

            foreach ($input['attendance'] as $record) {
                $validationErrors = $this->validateAttendanceData(array_merge($record, ['session_id' => $input['session_id']]));
                if (!empty($validationErrors)) {
                    $errors[] = ['student_id' => $record['student_id'] ?? 'unknown', 'errors' => $validationErrors];
                    continue;
                }

                $stmt = $this->db->prepare("
                    INSERT INTO attendance (session_id, student_id, status, marked_by, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    status = VALUES(status),
                    marked_by = VALUES(marked_by),
                    timestamp = VALUES(timestamp)
                ");

                $timestamp = $record['timestamp'] ?? date('Y-m-d H:i:s');

                $stmt->execute([
                    $input['session_id'],
                    $record['student_id'],
                    $record['status'],
                    $user['id'],
                    $timestamp
                ]);

                $successCount++;
            }

            $this->db->commit();

            echo json_encode([
                'status' => 'success',
                'message' => "Bulk attendance marked successfully",
                'success_count' => $successCount,
                'errors' => $errors
            ]);

        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to mark bulk attendance']);
        }
    }

    /**
     * Verify if teacher has access to a session
     */
    private function verifyTeacherSessionAccess($teacherId, $sessionId) {
        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count
                FROM live_class_sessions lcs
                JOIN subject_teachers st ON lcs.subject_id = st.subject_id
                WHERE lcs.id = ? AND st.teacher_id = ?
            ");

            $stmt->execute([$sessionId, $teacherId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            return $result['count'] > 0;

        } catch (Exception $e) {
            return false;
        }
    }
}