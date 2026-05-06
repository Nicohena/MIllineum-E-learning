<?php

namespace Controllers;

use Models\Forum;
use Core\JwtHandler;

class ForumController {
    private $forumModel;

    public function __construct() {
        $this->forumModel = new Forum();
    }

    private function auth() {
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
        return $decoded;
    }

    public function getCategories() {
        $categories = $this->forumModel->getCategories();
        echo json_encode(['status' => 'success', 'categories' => $categories]);
    }

    public function getThreads() {
        $categoryId = $_GET['category_id'] ?? null;
        $searchTerm = $_GET['search'] ?? null;
        $threads = $this->forumModel->getThreads($categoryId, $searchTerm);
        echo json_encode(['status' => 'success', 'threads' => $threads]);
    }

    public function getThread($id) {
        $thread = $this->forumModel->getThread($id);
        if (!$thread) {
            http_response_code(404);
            echo json_encode(['error' => 'Thread not found']);
            return;
        }
        echo json_encode(['status' => 'success', 'thread' => $thread]);
    }

    public function createThread() {
        $user = $this->auth();
        if (!$user) return;

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['category_id']) || empty($data['title']) || empty($data['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        $title = trim($data['title']);
        $content = trim($data['content']);
        if ($title === '' || $content === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Title or content cannot be empty']);
            return;
        }

        if (strlen($title) > 255 || strlen($content) > 5000) {
            http_response_code(400);
            echo json_encode(['error' => 'Title or content too long']);
            return;
        }

        $title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
        $content = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');

        $resultId = $this->forumModel->createThread(
            $data['category_id'],
            $user['id'],
            $title,
            $content
        );

        if ($resultId) {
            echo json_encode(['status' => 'success', 'thread_id' => $resultId, 'message' => 'Thread created']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create thread']);
        }
    }

    public function createReply() {
        $user = $this->auth();
        if (!$user) return;

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['thread_id']) || empty($data['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        $content = trim($data['content']);
        if ($content === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Content cannot be empty']);
            return;
        }

        if (strlen($content) > 4000) {
            http_response_code(400);
            echo json_encode(['error' => 'Content too long']);
            return;
        }

        $content = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');

        $resultId = $this->forumModel->createReply(
            $data['thread_id'],
            $user['id'],
            $content
        );

        if ($resultId) {
            // Create notification for thread author
            $thread = $this->forumModel->getThread($data['thread_id']);
            if ($thread && $thread['author_id'] != $user['id']) {
                $notificationModel = new \Models\Notification();
                $notificationModel->create(
                    $thread['author_id'],
                    'forum_reply',
                    'New Forum Reply',
                    $user['name'] . ' replied to your topic: ' . $thread['title'],
                    ($thread['author_role'] === 'student' ? '/student/forum' : '/teacher/forum')
                );
            }
            echo json_encode(['status' => 'success', 'reply_id' => $resultId, 'message' => 'Reply added']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add reply']);
        }
    }

    public function togglePin($id) {
        $user = $this->auth();
        if (!$user || $user['role'] !== 'teacher' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if ($this->forumModel->togglePin($id)) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(500);
        }
    }
}
