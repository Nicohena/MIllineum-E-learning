<?php

namespace Models;

use Core\Database;
use PDO;

class ClassModel {
    private $db;
    private $table = 'classes';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM " . $this->table);
        return $stmt->fetchAll();
    }

    public function findById($id) {
        $sql = "SELECT * FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function create($name) {
        $sql = "INSERT INTO " . $this->table . " (name) VALUES (:name)";
        $stmt = $this->db->prepare($sql);
        if ($stmt->execute(['name' => $name])) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function delete($id) {
        $sql = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
