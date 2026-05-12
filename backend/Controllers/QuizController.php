<?php

namespace Controllers;

use Core\Database;
use Core\JwtHandler;
use Models\Quiz;
use Models\QuizAttempt;
use PDO;

class QuizController {
    private $quizModel;
    private $attemptModel;
    private $db;

    public function __construct() {
        $this->quizModel = new Quiz();
        $this->attemptModel = new QuizAttempt();
        $this->db = Database::getInstance()->getConnection();
    }

    private function auth($requiredRole = null) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

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

    private function teacherOwnsCourse($courseId, $teacherId) {
        $stmt = $this->db->prepare("SELECT instructor_id FROM courses WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $courseId]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);
        return $course && (int)$course['instructor_id'] === (int)$teacherId;
    }

    private function studentCanAccessQuiz($quiz, $studentId) {
        $stmt = $this->db->prepare("SELECT class_id FROM users WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $studentId]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);
        return $student && (int)$student['class_id'] === (int)$quiz['class_id'];
    }

    private function normalizeQuestions($questions) {
        if (!is_array($questions) || count($questions) === 0) {
            return false;
        }

        $normalized = [];
        foreach ($questions as $index => $question) {
            $text = trim($question['text'] ?? '');
            $options = $question['options'] ?? [];
            $correctIndex = isset($question['correct_index']) ? (int)$question['correct_index'] : -1;

            if ($text === '' || !is_array($options) || count($options) < 2) {
                return false;
            }

            $cleanOptions = array_values(array_filter(array_map('trim', $options), fn($value) => $value !== ''));
            if (count($cleanOptions) < 2 || $correctIndex < 0 || $correctIndex >= count($cleanOptions)) {
                return false;
            }

            $normalized[] = [
                'id' => $index + 1,
                'text' => $text,
                'options' => $cleanOptions,
                'correct_index' => $correctIndex,
                'points' => max(1, (int)($question['points'] ?? 1)),
            ];
        }

        return $normalized;
    }

    private function stripAnswers($questions) {
        return array_map(function ($question) {
            unset($question['correct_index']);
            return $question;
        }, $questions);
    }

    public function createQuiz() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        foreach (['course_id', 'title', 'due_date', 'questions'] as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '{$field}' is required"]);
                return;
            }
        }

        if (!$this->teacherOwnsCourse($data['course_id'], $teacher['id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'You are not the instructor of this course']);
            return;
        }

        $dueTimestamp = strtotime($data['due_date']);
        if (!$dueTimestamp || $dueTimestamp <= time()) {
            http_response_code(400);
            echo json_encode(['error' => 'Due date must be a valid future date']);
            return;
        }

        $questions = $this->normalizeQuestions($data['questions']);
        if (!$questions) {
            http_response_code(400);
            echo json_encode(['error' => 'Each question needs text, at least two options, and one correct answer']);
            return;
        }

        $result = $this->quizModel->create(
            $data['course_id'],
            $teacher['id'],
            trim($data['title']),
            trim($data['description'] ?? ''),
            date('Y-m-d H:i:s', $dueTimestamp),
            max(1, (int)($data['time_limit_minutes'] ?? 15)),
            $questions
        );

        if ($result) {
            echo json_encode(['status' => 'success', 'quiz_id' => $result]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create quiz']);
        }
    }

    public function getMyQuizzes() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        echo json_encode([
            'status' => 'success',
            'quizzes' => $this->quizModel->getByTeacher($teacher['id']),
        ]);
    }

    public function getAttempts() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        $quizId = $_GET['quiz_id'] ?? null;
        if (!$quizId) {
            http_response_code(400);
            echo json_encode(['error' => 'quiz_id is required']);
            return;
        }

        $quiz = $this->quizModel->findById($quizId);
        if (!$quiz || (int)$quiz['teacher_id'] !== (int)$teacher['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'attempts' => $this->attemptModel->getByQuiz($quizId),
        ]);
    }

    public function deleteQuiz() {
        $teacher = $this->auth('teacher');
        if (!$teacher) return;

        $quizId = $_GET['id'] ?? null;
        $quiz = $quizId ? $this->quizModel->findById($quizId) : null;
        if (!$quiz || (int)$quiz['teacher_id'] !== (int)$teacher['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        echo json_encode(['status' => $this->quizModel->delete($quizId) ? 'success' : 'error']);
    }

    public function getStudentQuizzes() {
        $student = $this->auth('student');
        if (!$student) return;

        echo json_encode([
            'status' => 'success',
            'quizzes' => $this->quizModel->getForStudent($student['id']),
        ]);
    }

    public function getStudentQuiz() {
        $student = $this->auth('student');
        if (!$student) return;

        $quizId = $_GET['id'] ?? null;
        $quiz = $quizId ? $this->quizModel->findById($quizId) : null;
        if (!$quiz) {
            http_response_code(404);
            echo json_encode(['error' => 'Quiz not found']);
            return;
        }

        if (!$this->studentCanAccessQuiz($quiz, $student['id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $questions = json_decode($quiz['questions_json'], true) ?: [];
        $attempt = $this->attemptModel->findByQuizAndStudent($quizId, $student['id']);

        echo json_encode([
            'status' => 'success',
            'quiz' => [
                'id' => $quiz['id'],
                'title' => $quiz['title'],
                'description' => $quiz['description'],
                'due_date' => $quiz['due_date'],
                'time_limit_minutes' => $quiz['time_limit_minutes'],
                'questions' => $this->stripAnswers($questions),
                'attempt' => $attempt,
            ],
        ]);
    }

    public function submitQuiz() {
        $student = $this->auth('student');
        if (!$student) return;

        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        if (empty($data['quiz_id']) || !isset($data['answers']) || !is_array($data['answers'])) {
            http_response_code(400);
            echo json_encode(['error' => 'quiz_id and answers are required']);
            return;
        }

        $quiz = $this->quizModel->findById($data['quiz_id']);
        if (!$quiz) {
            http_response_code(404);
            echo json_encode(['error' => 'Quiz not found']);
            return;
        }

        if (!$this->studentCanAccessQuiz($quiz, $student['id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if (strtotime($quiz['due_date']) < time()) {
            http_response_code(400);
            echo json_encode(['error' => 'This quiz is past its due date']);
            return;
        }

        $questions = json_decode($quiz['questions_json'], true) ?: [];
        $score = 0;
        $totalPoints = 0;
        $answers = [];

        foreach ($questions as $question) {
            $questionId = (string)$question['id'];
            $selected = isset($data['answers'][$questionId]) ? (int)$data['answers'][$questionId] : null;
            $points = (int)($question['points'] ?? 1);
            $totalPoints += $points;

            $isCorrect = $selected !== null && $selected === (int)$question['correct_index'];
            if ($isCorrect) {
                $score += $points;
            }

            $answers[$questionId] = [
                'selected_index' => $selected,
                'correct_index' => (int)$question['correct_index'],
                'is_correct' => $isCorrect,
            ];
        }

        $result = $this->attemptModel->submit($quiz['id'], $student['id'], $answers, $score, $totalPoints);
        if (!$result) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to submit quiz']);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Quiz submitted successfully',
            'result' => $result,
            'answers' => $answers,
        ]);
    }
}
