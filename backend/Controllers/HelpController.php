<?php

namespace Controllers;

use Models\Help;
use Core\JwtHandler;

class HelpController {
    private $helpModel;

    public function __construct() {
        $this->helpModel = new Help();
    }

    private function auth() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        if (strpos($authHeader, 'Bearer ') !== 0) return false;
        $token = substr($authHeader, 7);
        return JwtHandler::validateToken($token);
    }

    public function getFAQs() {
        $faqs = $this->helpModel->getFAQs(true);
        echo json_encode(['status' => 'success', 'faqs' => $faqs]);
    }

    public function submitQuery() {
        $user = $this->auth();
        $data = json_decode(file_get_contents('php://input'), true);
        $category = $data['category'] ?? 'general';
        $question = trim($data['question'] ?? '');

        if ($question === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Question is required']);
            return;
        }

        $userId = $user['id'] ?? null;
        $userName = $user['name'] ?? ($data['name'] ?? null);
        $userEmail = $user['email'] ?? ($data['email'] ?? null);

        $ok = $this->helpModel->createQuery($userId, $userName, $userEmail, $category, $question);
        if ($ok) {
            echo json_encode(['status' => 'success', 'message' => 'Query submitted']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to submit query']);
        }
    }

    public function getQueries() {
        $user = $this->auth();
        if (!$user || ($user['role'] !== 'admin' && $user['role'] !== 'teacher')) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $category = $_GET['category'] ?? null;
        $status = $_GET['status'] ?? null;
        $queries = $this->helpModel->getQueries($category, $status, 500);
        echo json_encode(['status' => 'success', 'queries' => $queries]);
    }
}
