<?php

namespace Controllers;

use Models\User;

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    /**
     * LOGIN
     * 
     * 

     */
    public function login() {
        header('Content-Type: application/json');

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $identifier = trim((string) ($data['identifier'] ?? $data['email'] ?? ''));
        $password = trim((string) ($data['password'] ?? ''));

        if ($identifier === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Login ID and password are required']);
            return;
        }

        $user = null;
        $isEmailLogin = filter_var($identifier, FILTER_VALIDATE_EMAIL) !== false;

        if ($isEmailLogin) {
            $user = $this->userModel->findByEmail($identifier);

            if ($user && ($user['role'] ?? null) === 'student') {
                http_response_code(401);
                echo json_encode(['error' => 'Students must sign in using Student ID']);
                return;
            }
        } else {
            $user = $this->userModel->findByStudentIdentifier($identifier);

            if (!$user || ($user['role'] ?? '') !== 'student') {
                $user = null;
            }
        }

        if (!$user || !isset($user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid login ID or password']);
            return;
        }

        if (!password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid login ID or password']);
            return;
        }

        unset($user['password_hash']);

        $token = \Core\JwtHandler::createToken([
            'id' => $user['id'],
            'role' => $user['role']
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user
        ]);
    }

    /**
     * Handle the registration request (Admin Only)
     * 
     * 
     * 
     * 
     * 
     */
    public function register() {
        header('Content-Type: application/json');

        $authHeader = $this->getAuthorizationHeader();

        if (strpos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Missing or invalid token']);
            return;
        }

        $token = substr($authHeader, 7);
        $decoded = \Core\JwtHandler::validateToken($token);

        if (!$decoded || ($decoded['role'] ?? '') !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Only admins can register users']);
            return;
        }

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $required = ['name', 'email', 'password', 'role'];

        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                return;
            }
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email format']);
            return;
        }

        $allowedRoles = ['student', 'teacher', 'admin'];

        if (!in_array($data['role'], $allowedRoles, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid role']);
            return;
        }

        if (strlen($data['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            return;
        }

        $grade = $data['grade'] ?? null;
        $teachingSubject = $data['teaching_subject'] ?? null;

        if ($data['role'] === 'student') {
            if (empty($grade)) {
                http_response_code(400);
                echo json_encode(['error' => 'Grade is required for students']);
                return;
            }

            if (!preg_match('/^(Grade\s*)?(9|10|11|12)$/i', trim($grade))) {
                http_response_code(400);
                echo json_encode(['error' => 'Student grade must be Grade 9-12']);
                return;
            }

            $studentIdentifier = strtoupper(uniqid('STU'));
        }

        if ($data['role'] === 'teacher' && empty($teachingSubject)) {
            http_response_code(400);
            echo json_encode(['error' => 'Teaching subject is required for teachers']);
            return;
        }

        $userData = [
            'name' => trim($data['name']),
            'email' => trim($data['email']),
            'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
            'role' => $data['role'],
            'grade' => $grade,
            'teaching_subject' => $teachingSubject,
            'student_identifier' => $studentIdentifier ?? null
        ];

        $newUserId = $this->userModel->create($userData);

        if ($newUserId) {
            $createdUser = $this->userModel->findById($newUserId);

            echo json_encode([
                'status' => 'success',
                'message' => 'User registered successfully',
                'user_id' => $newUserId,
                'student_identifier' => $createdUser['student_identifier'] ?? null
            ]);
            return;
        }

        http_response_code(500);
        echo json_encode(['error' => 'Failed to create user. Email may already exist.']);
    }

    /**
     * Resolve Authorization header across SAPIs and header casing differences.
     * 
     * 
     * 
     * 
     */
    private function getAuthorizationHeader() {
        $headers = function_exists('getallheaders') ? getallheaders() : [];

        foreach ($headers as $key => $value) {
            if (strcasecmp($key, 'Authorization') === 0) {
                return $value;
            }
        }

        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            return $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        return '';
    }
}