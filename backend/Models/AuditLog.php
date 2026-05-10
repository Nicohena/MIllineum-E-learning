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
}

