<?php

namespace Models;

use Core\Database;
use PDO;

class Message {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function sendGroupMessage($senderId, $classId, $content, $parentId = null) {
        $stmt = $this->db->prepare("INSERT INTO group_messages (sender_id, class_id, content, parent_id) VALUES (:s, :c, :content, :p)");
        $ok = $stmt->execute(['s' => $senderId, 'c' => $classId, 'content' => $content, 'p' => $parentId]);
        if ($ok) {
            $id = $this->db->lastInsertId();
            $this->appendHistory('group_messages', $id, [
                'sender_id' => $senderId,
                'class_id' => $classId,
                'content' => $content,
                'parent_id' => $parentId
            ]);
            return $id;
        }
        return false;
    }

    public function getGroupMessages($classId) {
        $sql = "SELECT gm.*, u.name as sender_name, u.role as sender_role 
                FROM group_messages gm
                JOIN users u ON u.id = gm.sender_id
                WHERE gm.class_id = :cid AND gm.parent_id IS NULL
                ORDER BY gm.created_at ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['cid' => $classId]);
        return $stmt->fetchAll();
    }

    public function sendMessage($senderId, $receiverId, $content, $parentId = null) {
        $stmt = $this->db->prepare("INSERT INTO messages (sender_id, receiver_id, content, parent_id) VALUES (:s, :r, :c, :p)");
        $ok = $stmt->execute(['s' => $senderId, 'r' => $receiverId, 'c' => $content, 'p' => $parentId]);
        if ($ok) {
            $id = $this->db->lastInsertId();
            $this->appendHistory('messages', $id, [
                'sender_id' => $senderId,
                'receiver_id' => $receiverId,
                'content' => $content,
                'parent_id' => $parentId
            ]);
            return $id;
        }
        return false;
    }

    private function appendHistory($table, $id, $payload) {
        $dir = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'logs';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $file = $dir . DIRECTORY_SEPARATOR . 'message_history.log';
        $entry = [
            'table' => $table,
            'id' => $id,
            'payload' => $payload,
            'timestamp' => date('c')
        ];
        file_put_contents($file, json_encode($entry) . PHP_EOL, FILE_APPEND | LOCK_EX);
    }

    public function getConversations($userId) {
        $sql = "SELECT DISTINCT 
                    CASE WHEN sender_id = :uid THEN receiver_id ELSE sender_id END as contact_id,
                    u.name as contact_name,
                    u.role as contact_role,
                    u.avatar as contact_avatar
                FROM messages m
                JOIN users u ON u.id = (CASE WHEN m.sender_id = :uid THEN m.receiver_id ELSE m.sender_id END)
                WHERE sender_id = :uid OR receiver_id = :uid
                ORDER BY m.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetchAll();
    }

    public function getMessages($userId, $contactId) {
        $sql = "SELECT * FROM messages 
                WHERE ((sender_id = :uid AND receiver_id = :cid) 
                   OR (sender_id = :cid AND receiver_id = :uid))
                   AND parent_id IS NULL
                ORDER BY created_at ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['uid' => $userId, 'cid' => $contactId]);
        
        // Mark as read
        $update = $this->db->prepare("UPDATE messages SET is_read = 1 WHERE sender_id = :cid AND receiver_id = :uid");
        $update->execute(['uid' => $userId, 'cid' => $contactId]);
        
        return $stmt->fetchAll();
    }

    public function getThreadMessages($parentId, $isGroup = false) {
        $table = $isGroup ? 'group_messages' : 'messages';
        $sql = "SELECT m.*, u.name as sender_name, u.role as sender_role 
                FROM $table m
                JOIN users u ON u.id = m.sender_id
                WHERE m.parent_id = :pid
                ORDER BY m.created_at ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['pid' => $parentId]);
        return $stmt->fetchAll();
    }

    public function getUnreadCount($userId) {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM messages WHERE receiver_id = :uid AND is_read = 0");
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    public function getMessageById($id, $isGroup = false) {
        $table = $isGroup ? 'group_messages' : 'messages';
        $stmt = $this->db->prepare("SELECT * FROM $table WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
