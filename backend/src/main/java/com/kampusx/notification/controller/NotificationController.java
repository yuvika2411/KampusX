package com.kampusx.notification.controller;

import com.kampusx.notification.dto.NotificationResponse;
import com.kampusx.notification.service.AppNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import com.kampusx.common.BadRequestException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final AppNotificationService notificationService;

    @GetMapping
    public Page<NotificationResponse> getMyNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BadRequestException(
                    "Invalid pagination parameters"
            );
        }

        return notificationService.getMyNotifications(
                authentication.getName(),
                PageRequest.of(
                        page,
                        size,
                        Sort.by("createdAt").descending()
                                .and(Sort.by("id").descending())
                )
        );
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(
            Authentication authentication
    ) {
        return Map.of(
                "unreadCount",
                notificationService.getUnreadCount(
                        authentication.getName()
                )
        );
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markAsRead(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return notificationService.markAsRead(
                id,
                authentication.getName()
        );
    }
}