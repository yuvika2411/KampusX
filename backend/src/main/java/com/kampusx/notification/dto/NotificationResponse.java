package com.kampusx.notification.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String message,
        Long issueId,
        boolean read,
        LocalDateTime createdAt
) {
}