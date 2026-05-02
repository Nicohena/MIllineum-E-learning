<?php

namespace Controllers;

use Models\Message;
use Models\User;
use Core\JwtHandler;

class MessageController {
    private $messageModel;
    private $userModel;

    public function __construct() {
        $this->messageModel = new Message();
        $this->userModel = new User();
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

    public function getConversations() {
        $user = $this->auth();
        if (!$user) return;

        $conversations = $this->messageModel->getConversations($user['id']);
        
        // Add Class Group if student or teacher assigned to a class
        $groupChat = null;
        if ($user['role'] === 'student') {
            $student = $this->userModel->findById($user['id']);
            if ($student['class_id']) {
                $groupChat = [
                    'contact_id' => 'group_' . $student['class_id'],
                    'contact_name' => $student['class_name'] . ' (Group Chat)',
                    'is_group' => true,
                    'class_id' => $student['class_id']
                ];
            }
        } else if ($user['role'] === 'teacher') {
            // Teachers see groups for their assigned classes
            $stmt = \Core\Database::getInstance()->getConnection()->prepare("
                SELECT DISTINCT c.id, c.name 
                FROM classes c
                JOIN class_assignments ca ON ca.class_id = c.id
                WHERE ca.teacher_id = :tid
            ");
            $stmt->execute(['tid' => $user['id']]);
            $teacherClasses = $stmt->fetchAll();
            
            foreach ($teacherClasses as $cls) {
                $conversations[] = [
                    'contact_id' => 'group_' . $cls['id'],
                    'contact_name' => $cls['name'] . ' (Group Chat)',
                    'is_group' => true,
                    'class_id' => $cls['id']
                ];
            }
        }

        if ($groupChat) {
            array_unshift($conversations, $groupChat);
        }

        echo json_encode(['status' => 'success', 'conversations' => $conversations]);
    }

    public function getMessages() {
        $user = $this->auth();
        if (!$user) return;

        $contactId = $_GET['contact_id'] ?? null;
        if (!$contactId) return;

        if (strpos($contactId, 'group_') === 0) {
            $classId = substr($contactId, 6);
            $messages = $this->messageModel->getGroupMessages($classId);
        } else {
            $messages = $this->messageModel->getMessages($user['id'], $contactId);
        }
        
        echo json_encode(['status' => 'success', 'messages' => $messages]);
    }

    public function sendMessage() {
        $user = $this->auth();
        if (!$user) return;

        $data = json_decode(file_get_contents('php://input'), true);
        $receiverId = $data['receiver_id'];
        
        if (strpos($receiverId, 'group_') === 0) {
            $classId = substr($receiverId, 6);
            $result = $this->messageModel->sendGroupMessage($user['id'], $classId, $data['content']);
        } else {
            $result = $this->messageModel->sendMessage($user['id'], $receiverId, $data['content']);
        }

        if ($result) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(500);
        }
    }

    public function getUnreadCount() {
        $user = $this->auth();
        if (!$user) return;

        $count = $this->messageModel->getUnreadCount($user['id']);
        echo json_encode(['status' => 'success', 'unread_count' => $count]);
    }

    public function getContacts() {
        $user = $this->auth();
        if (!$user) return;

        // Simplified: return all teachers if student, all students in their courses if teacher
        $contacts = [];
        if ($user['role'] === 'student') {
            // Get teachers for their class
            $stmt = \Core\Database::getInstance()->getConnection()->prepare("
                SELECT DISTINCT u.id, u.name, u.role 
                FROM users u
                JOIN class_assignments ca ON ca.teacher_id = u.id
                JOIN users student ON student.class_id = ca.class_id
                WHERE student.id = :sid
            ");
            $stmt->execute(['sid' => $user['id']]);
            $contacts = $stmt->fetchAll();
        } else if ($user['role'] === 'teacher') {
            // Get students in their courses
            $stmt = \Core\Database::getInstance()->getConnection()->prepare("
                SELECT DISTINCT u.id, u.name, u.role 
                FROM users u
                JOIN class_assignments ca ON ca.class_id = u.class_id
                WHERE ca.teacher_id = :tid
            ");
            $stmt->execute(['tid' => $user['id']]);
            $contacts = $stmt->fetchAll();
        }

        echo json_encode(['status' => 'success', 'contacts' => $contacts]);
    }
}
