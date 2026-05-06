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

        $result = $this->forumModel->createThread(
            $data['category_id'],
            $user['id'],
            $data['title'],
            $data['content']
        );

        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Thread created']);
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

        $result = $this->forumModel->createReply(
            $data['thread_id'],
            $user['id'],
            $data['content']
        );

        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Reply added']);
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
