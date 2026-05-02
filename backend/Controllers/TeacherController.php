<?php

namespace Controllers;

use Models\Chapter;
use Models\ChapterNote;
use Models\Material;
use Models\AcademicYear; // Optional for year-based access
use Utils\FileUploader;
use Utils\CloudinaryUploader;
use Core\Database;
use Core\JwtHandler;
use PDO;

class TeacherController {
    private $chapterModel;
    private $noteModel;
    private $materialModel;
    private $db;

    public function __construct() {
        $this->chapterModel = new Chapter();
        $this->noteModel = new ChapterNote();
        $this->materialModel = new Material();
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get all courses assigned to the logged-in teacher
     */
    public function getMyCourses() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $token = substr($authHeader, 7);
        $decoded = JwtHandler::validateToken($token);

        if (!$decoded || $decoded['role'] !== 'teacher') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Teacher access only']);
            return;
        }

        $teacherId = $decoded['id'];

        $stmt = $this->db->prepare("
            SELECT c.*, cl.name as class_name, s.name as subject_name 
            FROM courses c
            JOIN classes cl ON c.class_id = cl.id
            JOIN subjects s ON s.name = (SELECT teaching_subject FROM users WHERE id = c.instructor_id)
            WHERE c.instructor_id = :teacher_id
            ORDER BY c.created_at DESC
        ");
        
        // Simpler query if we don't want to rely on the teaching_subject match for now
        $stmt = $this->db->prepare("
            SELECT c.*, cl.name as class_name 
            FROM courses c
            LEFT JOIN classes cl ON c.class_id = cl.id
            WHERE c.instructor_id = :teacher_id
            ORDER BY c.created_at DESC
        ");
        
        $stmt->execute(['teacher_id' => $teacherId]);
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'courses' => $courses
        ]);
    }

    /**
     * Verify if the request is from an authorized Teacher for the specific course
     */
    private function verifyTeacher($courseId) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') !== 0) {
            return false;
        }

        $token = substr($authHeader, 7);
        $decoded = JwtHandler::validateToken($token);

        if (!$decoded || $decoded['role'] !== 'teacher') {
            return false;
        }

        // Verify if teacher is assigned to this course
        $stmt = $this->db->prepare("SELECT instructor_id FROM courses WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $courseId]);
        $course = $stmt->fetch();

        if (!$course || (int)$course['instructor_id'] !== (int)$decoded['id']) {
            return false;
        }

        return $decoded;
    }

    /**
     * Create a new chapter for a course
     */
    public function createChapter() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['course_id']) || empty($data['title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Course ID and Title are required']);
            return;
        }

        $teacher = $this->verifyTeacher($data['course_id']);
        if (!$teacher) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: You are not the instructor of this course']);
            return;
        }

        $result = $this->chapterModel->create($data['course_id'], $data['title'], $data['order_index'] ?? 0);
        if ($result) {
            echo json_encode(['status' => 'success', 'chapter_id' => $result]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create chapter']);
        }
    }

    /**
     * Add/Create a note for a chapter
     */
    public function addNote() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['chapter_id']) || empty($data['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Chapter ID and Content are required']);
            return;
        }

        $chapter = $this->chapterModel->findById($data['chapter_id']);
        if (!$chapter) {
            http_response_code(404);
            echo json_encode(['error' => 'Chapter not found']);
            return;
        }

        $teacher = $this->verifyTeacher($chapter['course_id']);
        if (!$teacher) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $result = $this->noteModel->create($data['chapter_id'], $data['content'], $teacher['id'], $data['is_published'] ?? false);
        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Note added successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add note']);
        }
    }

    /**
     * Add material (Learning or Reference) to a chapter
     * Supports both JSON and Multipart Form Data (for file uploads)
     */
    public function addMaterial() {
        // Handle both JSON and Form Data
        $data = !empty($_POST) ? $_POST : json_decode(file_get_contents('php://input'), true);
        
        // type: 'learning' or 'reference'
        $type = $data['type'] ?? 'learning';
        
        if (empty($data['chapter_id']) || empty($data['title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Chapter ID and Title are required']);
            return;
        }

        $chapter = $this->chapterModel->findById($data['chapter_id']);
        if (!$chapter) {
            http_response_code(404);
            echo json_encode(['error' => 'Chapter not found']);
            return;
        }

        if (!$this->verifyTeacher($chapter['course_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if ($type === 'learning') {
            $fileUrl  = $data['file_url'] ?? '';
            $fileType = $data['file_type'] ?? '';

            // HANDLE FILE UPLOAD IF PRESENT — uploads to Cloudinary
            if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
                // Cloudinary folder structure: elearning/course_{id}/chapter_{id}
                $folder = 'elearning/course_' . $chapter['course_id'] . '/chapter_' . $chapter['id'];
                $uploadResult = FileUploader::upload($_FILES['file'], $folder);

                if (is_array($uploadResult) && isset($uploadResult['error'])) {
                    http_response_code(400);
                    echo json_encode(['error' => $uploadResult['error']]);
                    return;
                }

                // $uploadResult is now a full Cloudinary https:// URL
                $fileUrl = $uploadResult;

                // Automatically set file type if not provided
                if (empty($fileType)) {
                    $fileType = strtoupper(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
                }
            }

            if (empty($fileUrl)) {
                http_response_code(400);
                echo json_encode(['error' => 'A file is required for learning materials.']);
                return;
            }

            $result = $this->materialModel->createLearning(
                $data['chapter_id'], 
                $data['title'], 
                $fileUrl, 
                $fileType, 
                $data['description'] ?? ''
            );
        } else {
            $referenceUrl = $data['url_or_link'] ?? ($data['file_url'] ?? '');
            if (empty($referenceUrl)) {
                http_response_code(400);
                echo json_encode(['error' => 'A URL or file link is required for reference materials.']);
                return;
            }

            $result = $this->materialModel->createReference(
                $data['chapter_id'], 
                $data['title'], 
                $data['source_type'] ?? 'link', 
                $referenceUrl
            );
        }

        if ($result) {
            echo json_encode([
                'status' => 'success', 
                'message' => 'Material added successfully',
                'file_url' => $fileUrl ?? null
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add material']);
        }
    }

    /**
     * Publish all notes for a teacher-owned course.
     */
    public function publishCourseContent() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['course_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Course ID is required']);
            return;
        }

        $teacher = $this->verifyTeacher($data['course_id']);
        if (!$teacher) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: You are not the instructor of this course']);
            return;
        }

        $stmt = $this->db->prepare(
            "UPDATE chapter_notes cn
             JOIN chapters ch ON ch.id = cn.chapter_id
             SET cn.is_published = 1
             WHERE ch.course_id = :course_id AND cn.created_by = :teacher_id"
        );

        $stmt->execute([
            'course_id' => $data['course_id'],
            'teacher_id' => $teacher['id']
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Course content published successfully',
            'updated_notes' => $stmt->rowCount()
        ]);
    }
}
