<?php

namespace Models;

use Core\Database;
use PDO;

class Timetable {
    private $db;
    private $table = 'timetable_entries';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->ensureTable();
    }

    private function ensureTable() {
        $sql = "CREATE TABLE IF NOT EXISTS " . $this->table . " (
            id INT AUTO_INCREMENT PRIMARY KEY,
            class_id INT NOT NULL,
            subject_id INT NOT NULL,
            teacher_id INT NOT NULL,
            academic_year_id INT NOT NULL,
            day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            room VARCHAR(100) DEFAULT NULL,
            notes TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,

            INDEX idx_timetable_class_day (class_id, day_of_week),
            INDEX idx_timetable_teacher_day (teacher_id, day_of_week),
            INDEX idx_timetable_year (academic_year_id)
        ) ENGINE=InnoDB";

        $this->db->exec($sql);
    }

    public function getAll($yearId = null, $classId = null) {
        $conditions = [];
        $params = [];

        if ($yearId) {
            $conditions[] = 'te.academic_year_id = :year_id';
            $params['year_id'] = $yearId;
        }

        if ($classId) {
            $conditions[] = 'te.class_id = :class_id';
            $params['class_id'] = $classId;
        }

        $where = count($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

        $sql = "SELECT te.*,
                       c.name AS class_name,
                       s.name AS subject_name,
                       u.name AS teacher_name,
                       ay.name AS academic_year_name
                FROM " . $this->table . " te
                JOIN classes c ON te.class_id = c.id
                JOIN subjects s ON te.subject_id = s.id
                JOIN users u ON te.teacher_id = u.id
                JOIN academic_years ay ON te.academic_year_id = ay.id
                {$where}
                ORDER BY FIELD(te.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
                         te.start_time ASC,
                         c.name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id) {
        $sql = "SELECT * FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function hasOverlap($classId, $teacherId, $yearId, $dayOfWeek, $startTime, $endTime, $excludeId = null) {
        $sql = "SELECT COUNT(*)
                FROM " . $this->table . "
                WHERE academic_year_id = :year_id
                  AND day_of_week = :day_of_week
                  AND (class_id = :class_id OR teacher_id = :teacher_id)
                  AND start_time < :end_time
                  AND end_time > :start_time";

        $params = [
            'year_id' => $yearId,
            'day_of_week' => $dayOfWeek,
            'class_id' => $classId,
            'teacher_id' => $teacherId,
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];

        if ($excludeId) {
            $sql .= " AND id <> :exclude_id";
            $params['exclude_id'] = $excludeId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn() > 0;
    }

    public function create($data) {
        $sql = "INSERT INTO " . $this->table . "
                (class_id, subject_id, teacher_id, academic_year_id, day_of_week, start_time, end_time, room, notes)
                VALUES
                (:class_id, :subject_id, :teacher_id, :academic_year_id, :day_of_week, :start_time, :end_time, :room, :notes)";

        $stmt = $this->db->prepare($sql);
        if ($stmt->execute($this->params($data))) {
            return $this->db->lastInsertId();
        }

        return false;
    }

    public function update($id, $data) {
        $sql = "UPDATE " . $this->table . "
                SET class_id = :class_id,
                    subject_id = :subject_id,
                    teacher_id = :teacher_id,
                    academic_year_id = :academic_year_id,
                    day_of_week = :day_of_week,
                    start_time = :start_time,
                    end_time = :end_time,
                    room = :room,
                    notes = :notes
                WHERE id = :id";

        $params = $this->params($data);
        $params['id'] = $id;

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete($id) {
        $sql = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    private function params($data) {
        return [
            'class_id' => (int) $data['class_id'],
            'subject_id' => (int) $data['subject_id'],
            'teacher_id' => (int) $data['teacher_id'],
            'academic_year_id' => (int) $data['academic_year_id'],
            'day_of_week' => $data['day_of_week'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'room' => $data['room'] ?? null,
            'notes' => $data['notes'] ?? null,
        ];
    }
}
