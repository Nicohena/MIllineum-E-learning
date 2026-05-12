<?php

namespace Controllers;

use Models\Notification;
use Models\User;
use Core\JwtHandler;
use Utils\NotificationHelper;

class NotificationController {
    private $notificationModel;
    private $userModel;

    public function __construct() {
        $this->notificationModel = new Notification();
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

    public function getNotificationStats() {
        $user = $this->auth();
        if (!$user) return;

        $stats = $this->notificationModel->getNotificationStats($user['id']);
        
        echo json_encode([
            'status' => 'success',
            'stats' => $stats
        ]);
    }

    public function getNotificationsByType() {
        $user = $this->auth();
        if (!$user) return;

        $type = $_GET['type'] ?? 'all';
        $limit = (int)($_GET['limit'] ?? 20);

        if ($type === 'all') {
            $notifications = $this->notificationModel->getForUser($user['id'], $limit);
        } else {
            $notifications = $this->notificationModel->getNotificationsByType($user['id'], $type, $limit);
        }

        echo json_encode([
            'status' => 'success',
            'type' => $type,
            'notifications' => $notifications
        ]);
    }

    public function markRead($id) {
        $user = $this->auth();
        if (!$user) return;

        $success = $this->notificationModel->markAsRead($id, $user['id']);
        if ($success) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Failed to mark as read']);
        }
    }

    public function markAllRead() {
        $user = $this->auth();
        if (!$user) return;

        $success = $this->notificationModel->markAllAsRead($user['id']);
        if ($success) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Failed to mark all as read']);
        }
    }

    public function markReadBatch() {
        $user = $this->auth();
        if (!$user) return;

        $data = json_decode(file_get_contents('php://input'), true);
        $ids = $data['notification_ids'] ?? [];

        if (empty($ids)) {
            http_response_code(400);
            echo json_encode(['error' => 'No notification IDs provided']);
            return;
        }

        $success = $this->notificationModel->markAsReadBatch($ids, $user['id']);
        if ($success) {
            echo json_encode(['status' => 'success', 'count' => count($ids)]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Failed to mark notifications as read']);
        }
    }

    public function deleteNotification($id) {
        $user = $this->auth();
        if (!$user) return;

        $success = $this->notificationModel->delete($id, $user['id']);
        if ($success) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Failed to delete notification']);
        }
    }

    public function deleteAllNotifications() {
        $user = $this->auth();
        if (!$user) return;

        $success = $this->notificationModel->deleteAll($user['id']);
        if ($success) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Failed to delete notifications']);
        }
    }

    public function sendNotification() {
        $user = $this->auth();
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Only admins can send notifications']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $recipientId = $data['recipient_id'] ?? null;
        $type = $data['type'] ?? 'announcement';
        $title = $data['title'] ?? '';
        $content = $data['content'] ?? '';
        $link = $data['link'] ?? null;
        $sendEmail = $data['send_email'] ?? true;
        $sendPush = $data['send_push'] ?? true;

        if (!$recipientId || !$title || !$content) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        // Get recipient user info
        $recipient = $this->userModel->getById($recipientId);
        if (!$recipient) {
            http_response_code(404);
            echo json_encode(['error' => 'Recipient not found']);
            return;
        }

        // Create and send notification
        $result = NotificationHelper::create(
            $recipientId,
            $type,
            $title,
            $content,
            [
                'link' => $link,
                'send_email' => $sendEmail,
                'send_push' => $sendPush,
                'user_email' => $recipient['email'],
                'recipient_name' => $recipient['name']
            ]
        );

        if ($result['success']) {
            echo json_encode([
                'status' => 'success',
                'notification_id' => $result['notification_id'],
                'email_sent' => $result['email_sent'],
                'push_sent' => $result['push_sent']
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'error' => 'Failed to send notification',
                'errors' => $result['errors']
            ]);
        }
    }
}
