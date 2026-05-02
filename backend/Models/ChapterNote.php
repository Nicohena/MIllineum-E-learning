<?php

namespace Models;

use Core\Database;
use PDO;

class ChapterNote {
    private $db;
    private $table = 'chapter_notes';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($chapterId, $content, $teacherId, $isPublished = false) {
        $sql = "INSERT INTO " . $this->table . " (chapter_id, content, created_by, is_published) 
                VALUES (:chapter_id, :content, :created_by, :is_published)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'chapter_id' => $chapterId,
            'content' => $content,
            'created_by' => $teacherId,
            'is_published' => $isPublished ? 1 : 0
        ]);
    }

    public function getByChapter($chapterId, $onlyPublished = true) {
        // Join with users to include author/teacher details so students can see who authored/published notes
        $sql = "SELECT cn.*, u.id as author_id, u.name as author_name
                FROM " . $this->table . " cn
                LEFT JOIN users u ON u.id = cn.created_by
                WHERE cn.chapter_id = :chapter_id";

        if ($onlyPublished) {
            $sql .= " AND cn.is_published = 1";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['chapter_id' => $chapterId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
