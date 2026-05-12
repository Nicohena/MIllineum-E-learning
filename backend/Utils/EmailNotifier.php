<?php

namespace Utils;

class EmailNotifier {
    /**
     * Send email notification
     * @param string $recipientEmail Email address of recipient
     * @param string $subject Email subject
     * @param string $title Notification title
     * @param string $content Notification content
     * @param string|null $link Optional link for the notification
     * @return bool Success status
     */
    public static function send($recipientEmail, $subject, $title, $content, $link = null) {
        try {
            // Email headers
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
            $headers .= "From: notifications@millenniumelearning.com" . "\r\n";
            $headers .= "Reply-To: support@millenniumelearning.com" . "\r\n";

            // Build email body
            $htmlBody = self::buildHtmlBody($title, $content, $link);

            // Send email
            $result = mail($recipientEmail, $subject, $htmlBody, $headers);

            // Log email sending
            if ($result) {
                self::logEmailSent($recipientEmail, $subject);
            }

            return $result;
        } catch (\Exception $e) {
            error_log("Email notification error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Build HTML email body
     */
    private static function buildHtmlBody($title, $content, $link = null) {
        $buttonHtml = '';
        if ($link) {
            $buttonHtml = "<p><a href='" . htmlspecialchars($link) . "' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>View Details</a></p>";
        }

        $html = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
                .header { background: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                .content { background: white; padding: 20px; }
                .footer { background: #f5f5f5; padding: 10px; font-size: 12px; color: #666; text-align: center; border-radius: 0 0 5px 5px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>" . htmlspecialchars($title) . "</h2>
                </div>
                <div class='content'>
                    <p>" . htmlspecialchars($content) . "</p>
                    " . $buttonHtml . "
                </div>
                <div class='footer'>
                    <p>© 2026 Millennium E-Learning System. All rights reserved.</p>
                    <p><a href='https://millenniumelearning.com/unsubscribe' style='color: #007bff; text-decoration: none;'>Unsubscribe from notifications</a></p>
                </div>
            </div>
        </body>
        </html>";

        return $html;
    }

    /**
     * Log email sending for audit
     */
    private static function logEmailSent($email, $subject) {
        $logMessage = date('[Y-m-d H:i:s] ') . "Email sent to: $email | Subject: $subject\n";
        @file_put_contents(__DIR__ . '/../Logs/email.log', $logMessage, FILE_APPEND);
    }
}
