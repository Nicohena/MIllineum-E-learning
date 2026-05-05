<?php

namespace Controllers;

use Models\User;
use Models\Assignment;
use Models\AcademicYear;
use Models\Chapter;
use Models\ChapterNote;
use Models\Material;
use Core\JwtHandler;
use PDO;

class StudentController {
    private $userModel;
    private $assignmentModel;
    private $yearModel;
    private $chapterModel;
    private $noteModel;
    private $materialModel;
    private $db;

    public function __construct() {
        $this->userModel = new User();
        $this->assignmentModel = new Assignment();
        $this->yearModel = new AcademicYear();
        $this->chapterModel = new Chapter();
        $this->noteModel = new ChapterNote();
        $this->materialModel = new Material();
        $this->db = \Core\Database::getInstance()->getConnection();
    }

    private function buildUploadUrl($path) {
        if (!$path) {
            return $path;
        }

        if (preg_match('#^https?://#i', $path)) {
            return $path;
        }

        $normalizedPath = ltrim(str_replace('\\', '/', $path), '/');
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $basePath = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');

        return $basePath . '/Uploads/' . $normalizedPath;
    }

    /**
     * Get the student's assigned schedule (subjects and teachers)
     */
    public function getSchedule() {
        // 1. Verify Authorization
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Missing or invalid token']);
            return;
        }

        $token = substr($authHeader, 7);
        $decoded = JwtHandler::validateToken($token);

        if (!$decoded || $decoded['role'] !== 'student') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Only students can access the student schedule']);
            return;
        }

        // 2. Fetch Student Data to get their class_id
        $student = $this->userModel->findById($decoded['id']);
        
        if (!$student['class_id']) {
            echo json_encode([
                'status' => 'success',
                'message' => 'You are not yet assigned to a specific class section.',
                'class' => null,
                'schedule' => []
            ]);
            return;
        }

        // 3. Get Active Academic Year
        $activeYear = $this->yearModel->getActiveYear();
        if (!$activeYear) {
            http_response_code(500);
            echo json_encode(['error' => 'No active academic year found']);
            return;
        }

        // 4. Fetch all assignments for this class and the active year, including course_id
        $stmt = $this->db->prepare("
            SELECT ca.*, s.name as subject_name, u.name as teacher_name, c.id as course_id
            FROM class_assignments ca
            JOIN subjects s ON ca.subject_id = s.id
            JOIN users u ON ca.teacher_id = u.id
            LEFT JOIN courses c ON c.class_id = ca.class_id AND c.instructor_id = ca.teacher_id
            WHERE ca.class_id = :class_id AND ca.academic_year_id = :year_id
        ");
        $stmt->execute([
            'class_id' => $student['class_id'],
            'year_id' => $activeYear['id']
        ]);
        $schedule = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'academic_year' => $activeYear['name'],
            'class' => [
                'id' => $student['class_id'],
                'name' => $student['class_name']
            ],
            'schedule' => $schedule
        ]);
    }

    /**
     * Get full course content grouped by chapters
     */
    public function getCourseContent() {
        // Simple verification (public or based on student enrollment)
        $courseId = $_GET['course_id'] ?? null;
        if (!$courseId) {
            http_response_code(400);
            echo json_encode(['error' => 'Course ID is required']);
            return;
        }

        // 1. Fetch all chapters
        $chapters = $this->chapterModel->getByCourse($courseId);
        $structuredChapters = [];

        foreach ($chapters as $chapter) {
            // 2. Fetch published notes
            $notes = $this->noteModel->getByChapter($chapter['id'], true);
            
            // 3. Fetch materials
            $learning = $this->materialModel->getLearningByChapter($chapter['id']);
            $reference = $this->materialModel->getReferenceByChapter($chapter['id']);

            $learning = array_map(function ($material) {
                $material['file_url'] = $this->buildUploadUrl($material['file_url'] ?? '');
                return $material;
            }, $learning);

            $reference = array_map(function ($material) {
                $material['url_or_link'] = $material['url_or_link']
                    ?? $material['file_url_or_link']
                    ?? '';
                return $material;
            }, $reference);

            $structuredChapters[] = [
                'id' => $chapter['id'],
                'title' => $chapter['title'],
                'order' => $chapter['order_index'],
                'notes' => $notes,
                'learning_materials' => $learning,
                'reference_materials' => $reference
            ];
        }

        echo json_encode([
            'status' => 'success',
            'course_id' => $courseId,
            'chapters' => $structuredChapters
        ]);
    }

    /**
     * Get all graded assignments for the student
     */
    public function getGrades() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $token = substr($authHeader, 7);
        $decoded = JwtHandler::validateToken($token);

        if (!$decoded || $decoded['role'] !== 'student') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $studentId = $decoded['id'];

        $sql = "SELECT ts.*, ta.title as assignment_title, ta.points as total_points, 
                       ta.due_date, c.title as course_title, u.name as teacher_name
                FROM task_submissions ts
                JOIN task_assignments ta ON ts.assignment_id = ta.id
                JOIN courses c ON ta.course_id = c.id
                JOIN users u ON ta.teacher_id = u.id
                WHERE ts.student_id = :student_id AND ts.status = 'graded'
                ORDER BY ts.graded_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['student_id' => $studentId]);
        $grades = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'grades' => $grades
        ]);
    }
}
