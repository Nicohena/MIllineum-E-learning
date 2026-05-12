<?php

namespace Models;

use Core\Database;
use PDO;

class Help {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getFAQs($activeOnly = true) {
        $sql = "SELECT id, question, answer, category, created_at FROM faqs";
        if ($activeOnly) $sql .= " WHERE is_active = 1";
        $sql .= " ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createQuery($userId, $userName, $userEmail, $category, $question) {
        $stmt = $this->db->prepare("INSERT INTO help_queries (user_id, user_name, user_email, category, question) VALUES (:uid, :uname, :uemail, :cat, :q)");
        return $stmt->execute([
            'uid' => $userId,
            'uname' => $userName,
            'uemail' => $userEmail,
            'cat' => $category,
            'q' => $question
        ]);
    }

    public function getQueries($category = null, $status = null, $limit = 100) {
        $sql = "SELECT * FROM help_queries";
        $clauses = [];
        $params = [];
        if ($category) {
            $clauses[] = "category = :category";
            $params['category'] = $category;
        }
        if ($status) {
            $clauses[] = "status = :status";
            $params['status'] = $status;
        }
        if (!empty($clauses)) $sql .= ' WHERE ' . implode(' AND ', $clauses);
        $sql .= " ORDER BY created_at DESC LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue(':' . $k, $v);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
