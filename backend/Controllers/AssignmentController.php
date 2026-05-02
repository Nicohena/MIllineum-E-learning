<?php

namespace Controllers;

use Models\TaskAssignment;
use Models\TaskSubmission;
use Utils\FileUploader;
use Core\Database;
use Core\JwtHandler;
use PDO;

class AssignmentController {
    private $assignmentModel;
    private $submissionModel;
    private $db;

    public function __construct() {
        $this->assignmentModel = new TaskAssignment();
        $this->submissionModel = new TaskSubmission();
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

        $token   = substr($authHeader, 7);
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

    // ─── TEACHER ENDPOINTS ──────────────────────────────────────────

    /**
     * POST /api/assignments/create
     * Create a new task assignment (Teacher only)
     */
    public function createAssignment() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        // Handle both multipart (file attachment) and JSON
        $data = !empty($_POST) ? $_POST : json_decode(file_get_contents('php://input'), true);

        $required = ['course_id', 'title', 'due_date'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '{$field}' is required"]);
                return;
            }
        }

        // Verify teacher owns the course
        $stmt = $this->db->prepare("SELECT instructor_id FROM courses WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $data['course_id']]);
        $course = $stmt->fetch();
        if (!$course || (int)$course['instructor_id'] !== (int)$teacher['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'You are not the instructor of this course']);
            return;
        }

        $attachmentUrl = null;
        // Handle optional reference file upload
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $subFolder = "assignments/course_{$data['course_id']}";
            $uploadResult = FileUploader::upload($_FILES['file'], $subFolder);
            if (is_array($uploadResult) && isset($uploadResult['error'])) {
                http_response_code(400);
                echo json_encode(['error' => $uploadResult['error']]);
                return;
            }
            $attachmentUrl = $uploadResult;
        }

        $dueDate = str_replace('T', ' ', $data['due_date']);

        $result = $this->assignmentModel->create(
            $data['course_id'],
            $teacher['id'],
            $data['title'],
            $data['instructions'] ?? '',
            $dueDate,
            $data['points'] ?? 100,
            $attachmentUrl
        );

        if ($result) {
            echo json_encode(['status' => 'success', 'assignment_id' => $result]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create assignment']);
        }
    }

    /**
     * GET /api/assignments/my-assignments (Teacher)
     */
    public function getMyAssignments() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        $assignments = $this->assignmentModel->getByTeacher($teacher['id']);
        echo json_encode(['status' => 'success', 'assignments' => $assignments]);
    }

    /**
     * GET /api/assignments/submissions?assignment_id=X (Teacher)
     */
    public function getSubmissions() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        $assignmentId = $_GET['assignment_id'] ?? null;
        if (!$assignmentId) {
            http_response_code(400);
            echo json_encode(['error' => 'assignment_id is required']);
            return;
        }

        // Verify teacher owns the assignment
        $assignment = $this->assignmentModel->findById($assignmentId);
        if (!$assignment || (int)$assignment['teacher_id'] !== (int)$teacher['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $submissions = $this->submissionModel->getByAssignment($assignmentId);
        echo json_encode(['status' => 'success', 'submissions' => $submissions]);
    }

    /**
     * POST /api/assignments/grade
     * Grade a submission (Teacher only)
     */
    public function gradeSubmission() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['submission_id']) || !isset($data['grade'])) {
            http_response_code(400);
            echo json_encode(['error' => 'submission_id and grade are required']);
            return;
        }

        // Verify ownership chain
        $submission = $this->submissionModel->findById($data['submission_id']);
        if (!$submission) { http_response_code(404); return; }

        $assignment = $this->assignmentModel->findById($submission['assignment_id']);
        if (!$assignment || (int)$assignment['teacher_id'] !== (int)$teacher['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if ($this->submissionModel->grade($data['submission_id'], $data['grade'], $data['feedback'] ?? '')) {
            echo json_encode(['status' => 'success', 'message' => 'Submission graded']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to grade submission']);
        }
    }

    /**
     * DELETE /api/assignments/delete?id=X (Teacher)
     */
    public function deleteAssignment() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        $id = $_GET['id'] ?? null;
        if (!$id) { http_response_code(400); return; }

        $assignment = $this->assignmentModel->findById($id);
        if (!$assignment || (int)$assignment['teacher_id'] !== (int)$teacher['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if ($this->assignmentModel->delete($id)) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(500);
        }
    }

    /**
     * GET /api/assignments/recent-submissions
     * Fetch the 10 most recent submissions across all teacher's assignments
     */
    public function getRecentSubmissions() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        $sql = "SELECT ts.*, ta.title as assignment_title, u.name as student_name
                FROM task_submissions ts
                JOIN task_assignments ta ON ts.assignment_id = ta.id
                JOIN users u ON ts.student_id = u.id
                WHERE ta.teacher_id = :teacher_id
                ORDER BY ts.submitted_at DESC
                LIMIT 10";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['teacher_id' => $teacher['id']]);
        $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'submissions' => $submissions]);
    }

    // ─── STUDENT ENDPOINTS ──────────────────────────────────────────

    /**
     * GET /api/assignments/student
     */
    public function getStudentAssignments() {
        $student = $this->auth('student');
        if (!$student) return;

        $assignments = $this->assignmentModel->getForStudent($student['id']);
        echo json_encode(['status' => 'success', 'assignments' => $assignments]);
    }

    /**
     * POST /api/assignments/submit
     * Student submits a document
     */
    public function submitAssignment() {
        $student = $this->auth('student');
        if (!$student) return;

        $assignmentId = $_POST['assignment_id'] ?? null;
        if (!$assignmentId) {
            http_response_code(400);
            echo json_encode(['error' => 'assignment_id is required']);
            return;
        }

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'A document file is required']);
            return;
        }

        $assignment = $this->assignmentModel->findById($assignmentId);
        if (!$assignment) {
            http_response_code(404);
            echo json_encode(['error' => 'Assignment not found']);
            return;
        }

        $subFolder = "submissions/assignment_{$assignmentId}";
        $uploadResult = FileUploader::upload($_FILES['file'], $subFolder);
        if (is_array($uploadResult) && isset($uploadResult['error'])) {
            http_response_code(400);
            echo json_encode(['error' => $uploadResult['error']]);
            return;
        }

        $result = $this->submissionModel->submit(
            $assignmentId,
            $student['id'],
            $uploadResult,
            $_POST['notes'] ?? ''
        );

        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Assignment submitted successfully', 'file_url' => $uploadResult]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to submit assignment']);
        }
    }
}
