<?php

namespace Models;

use Core\Database;
use PDO;

class Forum {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getCategories() {
        $stmt = $this->db->query("SELECT * FROM forum_categories ORDER BY id ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getThreads($categoryId = null, $searchTerm = null) {
        $sql = "SELECT t.*, u.name as author_name, u.role as author_role, 
                       (SELECT COUNT(*) FROM forum_replies r WHERE r.thread_id = t.id) as reply_count,
                       c.name as category_name
                FROM forum_threads t
                JOIN users u ON t.author_id = u.id
                JOIN forum_categories c ON t.category_id = c.id
                WHERE 1=1";
        $params = [];

        if ($categoryId) {
            $sql .= " AND t.category_id = :cid";
            $params['cid'] = $categoryId;
        }

        if ($searchTerm) {
            $sql .= " AND (t.title LIKE :search OR t.content LIKE :search)";
            $params['search'] = "%$searchTerm%";
        }

        $sql .= " ORDER BY t.is_pinned DESC, t.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getThread($threadId) {
        $stmt = $this->db->prepare("
            SELECT t.*, u.name as author_name, u.role as author_role, c.name as category_name
            FROM forum_threads t
            JOIN users u ON t.author_id = u.id
            JOIN forum_categories c ON t.category_id = c.id
            WHERE t.id = :id
        ");
        $stmt->execute(['id' => $threadId]);
        $thread = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($thread) {
            // Update view count
            $this->db->prepare("UPDATE forum_threads SET views = views + 1 WHERE id = :id")->execute(['id' => $threadId]);
            
            // Get replies
            $stmt = $this->db->prepare("
                SELECT r.*, u.name as author_name, u.role as author_role
                FROM forum_replies r
                JOIN users u ON r.author_id = u.id
                WHERE r.thread_id = :tid
                ORDER BY r.created_at ASC
            ");
            $stmt->execute(['tid' => $threadId]);
            $thread['replies'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        return $thread;
    }

    public function createThread($categoryId, $authorId, $title, $content) {
        $stmt = $this->db->prepare("
            INSERT INTO forum_threads (category_id, author_id, title, content) 
            VALUES (:cid, :aid, :title, :content)
        ");
            $ok = $stmt->execute([
                'cid' => $categoryId,
                'aid' => $authorId,
                'title' => $title,
                'content' => $content
            ]);
            if ($ok) {
                $id = $this->db->lastInsertId();
                $this->appendHistory('forum_threads', $id, ['category_id' => $categoryId, 'author_id' => $authorId, 'title' => $title]);
                return $id;
            }
            return false;
    }

    public function createReply($threadId, $authorId, $content) {
        $stmt = $this->db->prepare("
            INSERT INTO forum_replies (thread_id, author_id, content) 
            VALUES (:tid, :aid, :content)
        ");
            $ok = $stmt->execute([
                'tid' => $threadId,
                'aid' => $authorId,
                'content' => $content
            ]);
            if ($ok) {
                $id = $this->db->lastInsertId();
                $this->appendHistory('forum_replies', $id, ['thread_id' => $threadId, 'author_id' => $authorId]);
                return $id;
            }
            return false;
    }

        private function appendHistory($table, $id, $payload) {
            $dir = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'logs';
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            $file = $dir . DIRECTORY_SEPARATOR . 'forum_history.log';
            $entry = [
                'table' => $table,
                'id' => $id,
                'payload' => $payload,
                'timestamp' => date('c')
            ];
            file_put_contents($file, json_encode($entry) . PHP_EOL, FILE_APPEND | LOCK_EX);
        }

    public function togglePin($threadId) {
        $stmt = $this->db->prepare("UPDATE forum_threads SET is_pinned = NOT is_pinned WHERE id = :id");
        return $stmt->execute(['id' => $threadId]);
    }

    public function deleteThread($threadId) {
        $stmt = $this->db->prepare("DELETE FROM forum_threads WHERE id = :id");
        return $stmt->execute(['id' => $threadId]);
    }
}
