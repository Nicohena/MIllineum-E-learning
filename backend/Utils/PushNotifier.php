<?php

namespace Utils;

/**
 * Push Notification Service
 * Handles web push notifications using service workers
 */
class PushNotifier {
    private static $subscriptions = [];

    /**
     * Send push notification to user device
     * @param int $userId User ID
     * @param string $title Notification title
     * @param string $body Notification body
     * @param string|null $icon Icon URL
     * @param string|null $badge Badge URL
     * @param string|null $tag Notification tag
     * @param string|null $link Action link
     * @return bool Success status
     */
    public static function send($userId, $title, $body, $icon = null, $badge = null, $tag = null, $link = null) {
        try {
            // Get user's push subscriptions
            $subscriptions = self::getUserSubscriptions($userId);

            if (empty($subscriptions)) {
                return false; // No active subscriptions
            }

            $payload = [
                'title' => $title,
                'body' => $body,
                'icon' => $icon ?? '/assets/images/notification-icon.png',
                'badge' => $badge ?? '/assets/images/notification-badge.png',
                'tag' => $tag ?? 'notification',
                'data' => [
                    'link' => $link,
                    'timestamp' => date('Y-m-d H:i:s')
                ]
            ];

            $success = true;
            foreach ($subscriptions as $subscription) {
                if (!self::sendToSubscription($subscription, $payload)) {
                    $success = false;
                }
            }

            return $success;
        } catch (\Exception $e) {
            error_log("Push notification error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Register push subscription for a user
     * @param int $userId User ID
     * @param array $subscription Subscription object from service worker
     * @return bool Success status
     */
    public static function registerSubscription($userId, $subscription) {
        try {
            // In production, store subscription in database
            // For now, we'll use the notification_subscriptions table
            return true;
        } catch (\Exception $e) {
            error_log("Push subscription registration error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get user's push subscriptions
     */
    private static function getUserSubscriptions($userId) {
        // This would query the database for subscriptions
        // Implementation depends on your database setup
        return [];
    }

    /**
     * Send to individual subscription
     */
    private static function sendToSubscription($subscription, $payload) {
        try {
            // Implementation for sending actual push via service worker
            // In a real app, you'd use a library like web-push
            return true;
        } catch (\Exception $e) {
            error_log("Error sending to subscription: " . $e->getMessage());
            return false;
        }
    }
}
