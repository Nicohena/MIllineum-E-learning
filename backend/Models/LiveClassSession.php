<?php

namespace Models;

use Core\Database;

class LiveClassSession {
    private $db;
    private $table = 'live_class_sessions';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($courseId, $teacherId, $title, $description, $meetingUrl, $scheduledAt, $durationMinutes = 60) {
        $sql = "INSERT INTO {$this->table}
                (course_id, teacher_id, title, description, meeting_url, scheduled_at, duration_minutes)
                VALUES (:course_id, :teacher_id, :title, :description, :meeting_url, :scheduled_at, :duration_minutes)";
        $stmt = $this->db->prepare($sql);

        if ($stmt->execute([
            'course_id' => $courseId,
            'teacher_id' => $teacherId,
            'title' => $title,
            'description' => $description,
            'meeting_url' => $meetingUrl,
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => $durationMinutes
        ])) {
            return $this->db->lastInsertId();
        }

        return false;
    }

    /**
     * Check if a teacher already has a live class overlapping the proposed time window.
     * Overlap rule: existing_start < new_end AND existing_end > new_start
     */
    public function hasTeacherTimeConflict($teacherId, $scheduledAt, $durationMinutes, $ignoreSessionId = null) {
        $sql = "SELECT lcs.*
                FROM {$this->table} lcs
                WHERE lcs.teacher_id = :teacher_id
                  AND lcs.status IN ('scheduled', 'live')
                  AND lcs.scheduled_at < DATE_ADD(:scheduled_at, INTERVAL :duration_minutes MINUTE)
                  AND DATE_ADD(lcs.scheduled_at, INTERVAL lcs.duration_minutes MINUTE) > :scheduled_at";

        $params = [
            'teacher_id' => $teacherId,
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => (int) $durationMinutes,
        ];

        if ($ignoreSessionId !== null) {
            $sql .= " AND lcs.id <> :ignore_session_id";
            $params['ignore_session_id'] = (int) $ignoreSessionId;
        }

        $sql .= " ORDER BY lcs.scheduled_at ASC LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }

    /**
     * Check if a class already has a live class overlapping the proposed time window.
     * Uses courses.class_id to map session -> class.
     */
    public function hasClassTimeConflict($classId, $scheduledAt, $durationMinutes, $ignoreSessionId = null) {
        $sql = "SELECT lcs.*, c.title AS course_title, c.class_id
                FROM {$this->table} lcs
                JOIN courses c ON lcs.course_id = c.id
                WHERE c.class_id = :class_id
                  AND lcs.status IN ('scheduled', 'live')
                  AND lcs.scheduled_at < DATE_ADD(:scheduled_at, INTERVAL :duration_minutes MINUTE)
                  AND DATE_ADD(lcs.scheduled_at, INTERVAL lcs.duration_minutes MINUTE) > :scheduled_at";

        $params = [
            'class_id' => $classId,
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => (int) $durationMinutes,
        ];

        if ($ignoreSessionId !== null) {
            $sql .= " AND lcs.id <> :ignore_session_id";
            $params['ignore_session_id'] = (int) $ignoreSessionId;
        }

        $sql .= " ORDER BY lcs.scheduled_at ASC LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function getByTeacher($teacherId) {
        $sql = "SELECT lcs.*, c.title AS course_title, c.class_id, cl.name AS class_name,
                       COUNT(u.id) AS attendee_count
                FROM {$this->table} lcs
                JOIN courses c ON lcs.course_id = c.id
                LEFT JOIN classes cl ON c.class_id = cl.id
                LEFT JOIN users u ON u.class_id = c.class_id AND u.role = 'student'
                WHERE lcs.teacher_id = :teacher_id
                GROUP BY lcs.id
                ORDER BY
                    FIELD(lcs.status, 'live', 'scheduled', 'ended', 'cancelled'),
                    lcs.scheduled_at ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['teacher_id' => $teacherId]);
        return $stmt->fetchAll();
    }

    public function getForStudent($studentId) {
        $sql = "SELECT lcs.*, c.title AS course_title, c.class_id, u.name AS teacher_name
                FROM {$this->table} lcs
                JOIN courses c ON lcs.course_id = c.id
                JOIN users u ON lcs.teacher_id = u.id
                WHERE c.class_id = (SELECT class_id FROM users WHERE id = :student_id)
                  AND lcs.status IN ('scheduled', 'live')
                ORDER BY
                    FIELD(lcs.status, 'live', 'scheduled'),
                    lcs.scheduled_at ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll();
    }

    public function updateStatus($id, $status) {
        $stmt = $this->db->prepare("UPDATE {$this->table} SET status = :status WHERE id = :id");
        return $stmt->execute(['id' => $id, 'status' => $status]);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
