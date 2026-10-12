package com.kampusx.notification.service;

import com.kampusx.notification.dto.NotificationResponse;
import com.kampusx.notification.entity.AppNotification;
import com.kampusx.notification.repository.AppNotificationRepository;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppNotificationService {

    private final AppNotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void notifyUser(
            User user,
            Long issueId,
            String message
    ) {
        if (user == null) {
            return;
        }

        AppNotification notification = new AppNotification();
        notification.setUser(user);
        notification.setIssueId(issueId);
        notification.setMessage(message);

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(
            String email,
            Pageable pageable
    ) {
        User user = getUser(email);

        return notificationRepository
                .findByUserId(user.getId(), pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = getUser(email);

        return notificationRepository
                .countByUserIdAndReadFalse(user.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(
            Long notificationId,
            String email
    ) {
        User user = getUser(email);

        AppNotification notification = notificationRepository
                .findByIdAndUserId(notificationId, user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Notification not found"
                        )
                );

        notification.setRead(true);

        return toResponse(notification);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );
    }

    private NotificationResponse toResponse(
            AppNotification notification
    ) {
        return new NotificationResponse(
                notification.getId(),
                notification.getMessage(),
                notification.getIssueId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}