<?php

namespace Utils;

use Models\Notification;

/**
 * Notification Helper
 * Centralizes notification creation and delivery
 */
class NotificationHelper {
    /**
     * Create and send notification with multiple channels
     * @param int $userId User ID
     * @param string $type Notification type (assignment, announcement, etc.)
     * @param string $title Notification title
     * @param string $content Notification content
     * @param array $options Additional options
     * @return array Result with status and IDs
     */
    public static function create($userId, $type, $title, $content, $options = []) {
        $result = [
            'success' => false,
            'notification_id' => null,
            'email_sent' => false,
            'push_sent' => false,
            'errors' => []
        ];

        try {
            // Extract options
            $link = $options['link'] ?? null;
            $sendEmail = $options['send_email'] ?? true;
            $sendPush = $options['send_push'] ?? true;
            $userEmail = $options['user_email'] ?? null;
            $recipientName = $options['recipient_name'] ?? null;

            // Create database notification
            $notificationModel = new Notification();
            $created = $notificationModel->create($userId, $type, $title, $content, $link);

            if ($created) {
                $result['success'] = true;
                $result['notification_id'] = $notificationModel->getLastId();

                // Send email if requested
                if ($sendEmail && $userEmail) {
                    $subject = self::buildEmailSubject($type, $title);
                    $emailSent = EmailNotifier::send($userEmail, $subject, $title, $content, $link);
                    $result['email_sent'] = $emailSent;

                    if (!$emailSent) {
                        $result['errors'][] = 'Email notification failed';
                    }
                }

                // Send push if requested
                if ($sendPush) {
                    $pushSent = PushNotifier::send(
                        $userId,
                        $title,
                        $content,
                        self::getIconForType($type),
                        null,
                        $type,
                        $link
                    );
                    $result['push_sent'] = $pushSent;

                    if (!$pushSent) {
                        $result['errors'][] = 'Push notification failed';
                    }
                }

                // Log notification creation
                self::logNotification($userId, $type, $title, $result);
            } else {
                $result['errors'][] = 'Failed to create notification';
            }

        } catch (\Exception $e) {
            $result['errors'][] = $e->getMessage();
            error_log("Notification helper error: " . $e->getMessage());
        }

        return $result;
    }

    /**
     * Build email subject based on notification type
     */
    private static function buildEmailSubject($type, $title) {
        $prefixes = [
            'assignment' => '[Assignment]',
            'announcement' => '[Announcement]',
            'grade' => '[Grade]',
            'message' => '[Message]',
            'course' => '[Course]',
            'attendance' => '[Attendance]',
            'deadline' => '[Deadline]',
            'live_class' => '[Class]',
            'default' => '[Notification]'
        ];

        $prefix = $prefixes[$type] ?? $prefixes['default'];
        return $prefix . ' ' . $title;
    }

    /**
     * Get icon URL for notification type
     */
    private static function getIconForType($type) {
        $icons = [
            'assignment' => '/assets/images/assignment-icon.png',
            'announcement' => '/assets/images/announcement-icon.png',
            'grade' => '/assets/images/grade-icon.png',
            'message' => '/assets/images/message-icon.png',
            'course' => '/assets/images/course-icon.png',
            'attendance' => '/assets/images/attendance-icon.png',
            'deadline' => '/assets/images/assignment-icon.png',
            'live_class' => '/assets/images/course-icon.png'
        ];

        return $icons[$type] ?? '/assets/images/notification-icon.png';
    }

    /**
     * Log notification creation for audit
     */
    private static function logNotification($userId, $type, $title, $result) {
        $logMessage = sprintf(
            "[%s] User:%d | Type:%s | Title:%s | Email:%s | Push:%s | Status:%s\n",
            date('Y-m-d H:i:s'),
            $userId,
            $type,
            $title,
            $result['email_sent'] ? 'Yes' : 'No',
            $result['push_sent'] ? 'Yes' : 'No',
            $result['success'] ? 'Success' : 'Failed'
        );

        @file_put_contents(__DIR__ . '/../Logs/notifications.log', $logMessage, FILE_APPEND);
    }
}
