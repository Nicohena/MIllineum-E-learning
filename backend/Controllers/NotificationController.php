<?php

namespace Controllers;

use Models\Notification;
use Core\JwtHandler;

class NotificationController {
    private $notificationModel;

    public function __construct() {
        $this->notificationModel = new Notification();
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

    public function getNotifications() {
        $user = $this->auth();
        if (!$user) return;

        $notifications = $this->notificationModel->getForUser($user['id']);
        $unreadCount = $this->notificationModel->getUnreadCount($user['id']);
        
        echo json_encode([
            'status' => 'success', 
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    public function markRead($id) {
        $user = $this->auth();
        if (!$user) return;

        $this->notificationModel->markAsRead($id, $user['id']);
        echo json_encode(['status' => 'success']);
    }

    public function markAllRead() {
        $user = $this->auth();
        if (!$user) return;

        $this->notificationModel->markAllAsRead($user['id']);
        echo json_encode(['status' => 'success']);
    }
}
