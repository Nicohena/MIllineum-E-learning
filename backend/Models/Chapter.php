<?php

namespace Models;

use Core\Database;
use PDO;

class Chapter {
    private $db;
    private $table = 'chapters';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($courseId, $title, $orderIndex = 0) {
        $sql = "INSERT INTO " . $this->table . " (course_id, title, order_index) VALUES (:course_id, :title, :order_index)";
        $stmt = $this->db->prepare($sql);
        if ($stmt->execute([
            'course_id' => $courseId,
            'title' => $title,
            'order_index' => $orderIndex
        ])) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function getByCourse($courseId) {
        $sql = "SELECT * FROM " . $this->table . " WHERE course_id = :course_id ORDER BY order_index ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetchAll();
    }

    public function findById($id) {
        $sql = "SELECT * FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
}
