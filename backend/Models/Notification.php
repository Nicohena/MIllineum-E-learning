<?php

namespace Models;

use Core\Database;
use PDO;

class Notification {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($userId, $type, $title, $content, $link = null) {
        $stmt = $this->db->prepare("
            INSERT INTO notifications (user_id, type, title, content, link) 
            VALUES (:uid, :type, :title, :content, :link)
        ");
        return $stmt->execute([
            'uid' => $userId,
            'type' => $type,
            'title' => $title,
            'content' => $content,
            'link' => $link
        ]);
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
        return $stmt->fetch(PDO::FETCH_ASSOC)['count'];
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
}
