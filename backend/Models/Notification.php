<?php

namespace Models;

use Core\Database;
use PDO;

class Notification {
    private $db;
    private $lastId = null;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($userId, $type, $title, $content, $link = null) {
        $stmt = $this->db->prepare("
            INSERT INTO notifications (user_id, type, title, content, link) 
            VALUES (:uid, :type, :title, :content, :link)
        ");
        $result = $stmt->execute([
            'uid' => $userId,
            'type' => $type,
            'title' => $title,
            'content' => $content,
            'link' => $link
        ]);

        if ($result) {
            $this->lastId = $this->db->lastInsertId();
        }

        return $result;
    }

    public function getLastId() {
        return $this->lastId;
    }

    public function getForUser($userId, $limit = 50) {
        $stmt = $this->db->prepare("
            SELECT * FROM notifications 
            WHERE user_id = :uid 
            ORDER BY created_at DESC 
            LIMIT :limit
        ");
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsRead($id, $userId) {
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :uid");
        return $stmt->execute(['id' => $id, 'uid' => $userId]);
    }

    public function markAllAsRead($userId) {
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = :uid");
        return $stmt->execute(['uid' => $userId]);
    }

    public function getUnreadCount($userId) {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = :uid AND is_read = 0");
        $stmt->execute(['uid' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] ?? 0;
    }

    public function delete($id, $userId) {
        $stmt = $this->db->prepare("DELETE FROM notifications WHERE id = :id AND user_id = :uid");
        return $stmt->execute(['id' => $id, 'uid' => $userId]);
    }

    public function deleteAll($userId) {
        $stmt = $this->db->prepare("DELETE FROM notifications WHERE user_id = :uid");
        return $stmt->execute(['uid' => $userId]);
    }

    public function getById($id, $userId) {
        $stmt = $this->db->prepare("SELECT * FROM notifications WHERE id = :id AND user_id = :uid");
        $stmt->execute(['id' => $id, 'uid' => $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getUnreadByType($userId, $type) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = :uid AND type = :type AND is_read = 0
        ");
        $stmt->execute(['uid' => $userId, 'type' => $type]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] ?? 0;
    }

    public function getNotificationsByType($userId, $type, $limit = 20) {
        $stmt = $this->db->prepare("
            SELECT * FROM notifications 
            WHERE user_id = :uid AND type = :type
            ORDER BY created_at DESC 
            LIMIT :limit
        ");
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':type', $type, PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getNotificationStats($userId) {
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
                SUM(CASE WHEN type = 'assignment' THEN 1 ELSE 0 END) as assignments,
                SUM(CASE WHEN type = 'announcement' THEN 1 ELSE 0 END) as announcements,
                SUM(CASE WHEN type = 'grade' THEN 1 ELSE 0 END) as grades,
                SUM(CASE WHEN type = 'message' THEN 1 ELSE 0 END) as messages
            FROM notifications 
            WHERE user_id = :uid
        ");
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function markAsReadBatch($ids, $userId) {
        if (empty($ids)) return false;

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $sql = "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN ($placeholders)";
        
        $stmt = $this->db->prepare($sql);
        $params = array_merge([$userId], $ids);
        
        return $stmt->execute($params);
    }
}
