<?php

namespace Controllers;

use Core\Database;
use Core\JwtHandler;
use Models\LiveClassSession;
use Models\AuditLog;

class LiveClassController {
    private $db;
    private $sessionModel;
    private $auditLog;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->sessionModel = new LiveClassSession();
        $this->auditLog = new AuditLog();
    }

    private function auth($requiredRole = null) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (strpos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return false;
        }

        $decoded = JwtHandler::validateToken(substr($authHeader, 7));
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

    private function teacherOwnsCourse($teacherId, $courseId) {
        $stmt = $this->db->prepare("SELECT id FROM courses WHERE id = :id AND instructor_id = :teacher_id LIMIT 1");
        $stmt->execute(['id' => $courseId, 'teacher_id' => $teacherId]);
        return (bool) $stmt->fetch();
    }

    private function teacherOwnsSession($teacherId, $sessionId) {
        $session = $this->sessionModel->findById($sessionId);
        if (!$session || (int) $session['teacher_id'] !== (int) $teacherId) {
            return false;
        }

        return $session;
    }

    public function createSession() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $required = ['course_id', 'title', 'meeting_url', 'scheduled_at'];

        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '{$field}' is required"]);
                return;
            }
        }

        if (!$this->teacherOwnsCourse($teacher['id'], $data['course_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'You are not the instructor of this course']);
            return;
        }

        if (!filter_var($data['meeting_url'], FILTER_VALIDATE_URL)) {
            http_response_code(400);
            echo json_encode(['error' => 'A valid meeting URL is required']);
            return;
        }

        $duration = max(15, (int) ($data['duration_minutes'] ?? 60));
        $scheduledAt = str_replace('T', ' ', $data['scheduled_at']);
        if (!strtotime($scheduledAt)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid scheduled_at datetime']);
            return;
        }

        // Validate timetable conflicts (teacher + class time overlap)
        $teacherConflict = $this->sessionModel->hasTeacherTimeConflict($teacher['id'], $scheduledAt, $duration);
        if ($teacherConflict) {
            http_response_code(409);
            echo json_encode([
                'error' => 'Timetable conflict: teacher already has a live class scheduled in this time window',
                'conflict' => [
                    'type' => 'teacher',
                    'session_id' => $teacherConflict['id'] ?? null,
                    'scheduled_at' => $teacherConflict['scheduled_at'] ?? null,
                    'duration_minutes' => $teacherConflict['duration_minutes'] ?? null,
                    'status' => $teacherConflict['status'] ?? null,
                ],
            ]);
            return;
        }

        $classId = null;
        try {
            $stmt = $this->db->prepare("SELECT class_id FROM courses WHERE id = :course_id LIMIT 1");
            $stmt->execute(['course_id' => $data['course_id']]);
            $classId = $stmt->fetchColumn();
        } catch (\Exception $e) {
            $classId = null;
        }

        if (!empty($classId)) {
            $classConflict = $this->sessionModel->hasClassTimeConflict($classId, $scheduledAt, $duration);
            if ($classConflict) {
                http_response_code(409);
                echo json_encode([
                    'error' => 'Timetable conflict: this class already has a live class scheduled in this time window',
                    'conflict' => [
                        'type' => 'class',
                        'session_id' => $classConflict['id'] ?? null,
                        'scheduled_at' => $classConflict['scheduled_at'] ?? null,
                        'duration_minutes' => $classConflict['duration_minutes'] ?? null,
                        'status' => $classConflict['status'] ?? null,
                        'course_title' => $classConflict['course_title'] ?? null,
                    ],
                ]);
                return;
            }
        }

        $sessionId = $this->sessionModel->create(
            $data['course_id'],
            $teacher['id'],
            $data['title'],
            $data['description'] ?? '',
            $data['meeting_url'],
            $scheduledAt,
            $duration
        );

        if ($sessionId) {
            $this->auditLog->log($teacher['id'] ?? null, 'teacher', 'live_class.create', 'live_class_session', (int)$sessionId, [
                'course_id' => (int)$data['course_id'],
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => (int)$duration,
            ]);
            echo json_encode(['status' => 'success', 'session_id' => $sessionId]);
            return;
        }

        http_response_code(500);
        echo json_encode(['error' => 'Failed to create live class']);
    }

    public function getTeacherSessions() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        echo json_encode([
            'status' => 'success',
            'sessions' => $this->sessionModel->getByTeacher($teacher['id'])
        ]);
    }

    public function getStudentSessions() {
        $student = $this->auth('student');
        if (!$student) return;

        echo json_encode([
            'status' => 'success',
            'sessions' => $this->sessionModel->getForStudent($student['id'])
        ]);
    }

    public function updateStatus() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $sessionId = $data['session_id'] ?? null;
        $status = $data['status'] ?? null;
        $allowed = ['scheduled', 'live', 'ended', 'cancelled'];

        if (!$sessionId || !in_array($status, $allowed, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'session_id and a valid status are required']);
            return;
        }

        if (!$this->teacherOwnsSession($teacher['id'], $sessionId)) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $this->sessionModel->updateStatus($sessionId, $status);
        $this->auditLog->log($teacher['id'] ?? null, 'teacher', 'live_class.update_status', 'live_class_session', (int)$sessionId, [
            'status' => $status,
        ]);
        echo json_encode(['status' => 'success']);
    }

    public function deleteSession() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        $sessionId = $_GET['id'] ?? null;
        if (!$sessionId) {
            http_response_code(400);
            echo json_encode(['error' => 'id is required']);
            return;
        }

        if (!$this->teacherOwnsSession($teacher['id'], $sessionId)) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $session = $this->sessionModel->findById($sessionId);
        $this->sessionModel->delete($sessionId);
        $this->auditLog->log($teacher['id'] ?? null, 'teacher', 'live_class.delete', 'live_class_session', (int)$sessionId, [
            'course_id' => $session['course_id'] ?? null,
            'scheduled_at' => $session['scheduled_at'] ?? null,
            'duration_minutes' => $session['duration_minutes'] ?? null,
        ]);
        echo json_encode(['status' => 'success']);
    }
}
