<?php

namespace Models;

use Core\Database;
use PDO;

class Material {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Create a learning material record
     */
    public function createLearning($chapterId, $title, $fileUrl, $fileType, $description = '') {
        $sql = "INSERT INTO learning_materials (chapter_id, title, file_url, file_type, description) 
                VALUES (:chapter_id, :title, :file_url, :file_type, :description)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'chapter_id' => $chapterId,
            'title' => $title,
            'file_url' => $fileUrl,
            'file_type' => $fileType,
            'description' => $description
        ]);
    }

    /**
     * Create a reference material record
     */
    public function createReference($chapterId, $title, $sourceType, $urlOrLink) {
        $sql = "INSERT INTO reference_materials (chapter_id, title, source_type, file_url_or_link) 
                VALUES (:chapter_id, :title, :source_type, :url_or_link)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'chapter_id' => $chapterId,
            'title' => $title,
            'source_type' => $sourceType,
            'url_or_link' => $urlOrLink
        ]);
    }

    /**
     * Get learning materials by chapter
     */
    public function getLearningByChapter($chapterId) {
        $sql = "SELECT * FROM learning_materials WHERE chapter_id = :chapter_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['chapter_id' => $chapterId]);
        return $stmt->fetchAll();
    }

    /**
     * Get reference materials by chapter
     */
    public function getReferenceByChapter($chapterId) {
        $sql = "SELECT * FROM reference_materials WHERE chapter_id = :chapter_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['chapter_id' => $chapterId]);
        return $stmt->fetchAll();
    }
}
