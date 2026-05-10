<?php

namespace Models;

use Core\Database;

class AuditLog {
    private $db;
    private $table = 'audit_logs';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function log($actorId, $actorRole, $action, $entityType = null, $entityId = null, $details = null) {
        $sql = "INSERT INTO {$this->table}
                (actor_id, actor_role, action, entity_type, entity_id, details, ip_address, user_agent, request_method, request_path)
                VALUES
                (:actor_id, :actor_role, :action, :entity_type, :entity_id, :details, :ip_address, :user_agent, :request_method, :request_path)";

        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? null);
        if (is_string($ip) && strpos($ip, ',') !== false) {
            $ip = trim(explode(',', $ip)[0]);
        }

        $path = $_SERVER['REQUEST_URI'] ?? null;
        if (is_string($path)) {
            $path = parse_url($path, PHP_URL_PATH) ?: $path;
        }

        $detailsJson = null;
        if ($details !== null) {
            $detailsJson = is_string($details) ? $details : json_encode($details, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'actor_id' => $actorId !== null ? (int)$actorId : null,
            'actor_role' => $actorRole !== null ? (string)$actorRole : null,
            'action' => (string)$action,
            'entity_type' => $entityType !== null ? (string)$entityType : null,
            'entity_id' => $entityId !== null ? (int)$entityId : null,
            'details' => $detailsJson,
            'ip_address' => $ip,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? null,
            'request_path' => $path,
        ]);
    }

    /**
     * Paginated audit log listing for admin review (optional filters).
     *
     * @param array $filters Keys: action (string), actor_id (int), entity_type (string)
     */
    public function countFiltered(array $filters) {
        [$whereSql, $params] = $this->buildFilterClause($filters);
        $sql = "SELECT COUNT(*) FROM {$this->table} al {$whereSql}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listFilteredWithActor(array $filters, $page, $perPage) {
        [$whereSql, $params] = $this->buildFilterClause($filters);
        $offset = max(0, ((int) $page - 1) * (int) $perPage);

        $sql = "SELECT al.*, u.name AS actor_name, u.email AS actor_email
                FROM {$this->table} al
                LEFT JOIN users u ON al.actor_id = u.id
                {$whereSql}
                ORDER BY al.created_at DESC, al.id DESC
                LIMIT " . (int) $perPage . " OFFSET " . (int) $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];

        foreach ($rows as &$row) {
            if (array_key_exists('details', $row) && $row['details'] !== null && $row['details'] !== '') {
                $decoded = json_decode((string) $row['details'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $row['details'] = $decoded;
                }
            }
        }

        return $rows;
    }

    /**
     * @return array{0: string, 1: array<string, mixed>}
     */
    private function buildFilterClause(array $filters) {
        $where = ['1=1'];
        $params = [];

        if (!empty($filters['action'])) {
            $where[] = 'al.action = :filter_action';
            $params['filter_action'] = (string) $filters['action'];
        }

        if (!empty($filters['actor_id'])) {
            $where[] = 'al.actor_id = :filter_actor_id';
            $params['filter_actor_id'] = (int) $filters['actor_id'];
        }

        if (!empty($filters['entity_type'])) {
            $where[] = 'al.entity_type = :filter_entity_type';
            $params['filter_entity_type'] = (string) $filters['entity_type'];
        }

        return ['WHERE ' . implode(' AND ', $where), $params];
    }
}

