<?php

namespace Controllers;

use Models\User;

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    /**
     * Handle the login request
     */
    public function login() {
        // Read JSON input
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $identifier = trim((string) ($data['identifier'] ?? $data['email'] ?? ''));
        $password = $data['password'] ?? null;

        if ($identifier === '' || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Login ID and password are required']);
            return;
        }

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
            if ($user && ($user['role'] ?? null) !== 'student') {
                $user = false;
            }
        }

        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid login ID or password']);
            return;
        }

        // Verify password
        if (password_verify($password, $user['password_hash'])) {
            // Success! Remove sensitive data from user object
            unset($user['password_hash']);
            
            // Generate JWT
            $token = \Core\JwtHandler::createToken([
                'id' => $user['id'],
                'role' => $user['role'],
                'email' => $user['email']
            ]);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid login ID or password']);
        }
    }

    /**
     * Handle the registration request (Admin Only)
     */
    public function register() {
        // 1. Check Authorization
        $authHeader = $this->getAuthorizationHeader();
        
        if (strpos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Missing or invalid token']);
            return;
        }

        $token = substr($authHeader, 7);
        $decoded = \Core\JwtHandler::validateToken($token);

        if (!$decoded || $decoded['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Only admins can register new users']);
            return;
        }

        // 2. Validate Input
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

        // 3. Role-specific validation
        $grade = $data['grade'] ?? null;
        $teachingSubject = $data['teaching_subject'] ?? null;

        if ($data['role'] === 'student' && empty($grade)) {
            http_response_code(400);
            echo json_encode(['error' => 'Grade is required for students']);
            return;
        }

        if ($data['role'] === 'student' && !preg_match('/^(Grade\s*)?(9|10|11|12)$/i', trim((string) $grade))) {
            http_response_code(400);
            echo json_encode(['error' => 'Student grade must be Grade 9, Grade 10, Grade 11, or Grade 12']);
            return;
        }

        if ($data['role'] === 'teacher' && empty($teachingSubject)) {
            http_response_code(400);
            echo json_encode(['error' => 'Teaching subject is required for teachers']);
            return;
        }

        // 4. Create User
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
            'role' => $data['role'],
            'grade' => $grade,
            'teaching_subject' => $teachingSubject
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
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user. Email might already exist.']);
        }
    }

    /**
     * Resolve Authorization header across SAPIs and header casing differences.
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
