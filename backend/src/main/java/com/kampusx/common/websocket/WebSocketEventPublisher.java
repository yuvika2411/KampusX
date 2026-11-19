package com.kampusx.common.websocket;

import com.kampusx.issue.dto.IssueResponse;
import com.kampusx.notification.dto.NotificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishIssueCreated(IssueResponse issue, String reporterEmail) {
        if (issue == null) return;
        WebSocketEvent<IssueResponse> event = WebSocketEvent.of("ISSUE_CREATED", issue);

        sendSafe("/topic/admin/issues", event);
        if (issue.getCategoryId() != null) {
            sendSafe("/topic/categories/" + issue.getCategoryId() + "/issues", event);
        }
        sendSafe("/topic/feed", event);
        if (reporterEmail != null && !reporterEmail.isBlank()) {
            sendUserSafe(reporterEmail, "/queue/issues", event);
        }
    }

    public void publishIssueAssigned(IssueResponse issue, String resolverEmail, String reporterEmail) {
        if (issue == null) return;
        WebSocketEvent<IssueResponse> event = WebSocketEvent.of("ISSUE_ASSIGNED", issue);

        sendSafe("/topic/admin/issues", event);
        if (issue.getCategoryId() != null) {
            sendSafe("/topic/categories/" + issue.getCategoryId() + "/issues", event);
        }
        sendSafe("/topic/feed", event);
        if (resolverEmail != null && !resolverEmail.isBlank()) {
            sendUserSafe(resolverEmail, "/queue/issues", event);
        }
        if (reporterEmail != null && !reporterEmail.isBlank()) {
            sendUserSafe(reporterEmail, "/queue/issues", event);
        }
    }

    public void publishIssueStatusChanged(IssueResponse issue, String resolverEmail, String reporterEmail) {
        if (issue == null) return;
        WebSocketEvent<IssueResponse> event = WebSocketEvent.of("ISSUE_STATUS_CHANGED", issue);

        sendSafe("/topic/admin/issues", event);
        if (issue.getCategoryId() != null) {
            sendSafe("/topic/categories/" + issue.getCategoryId() + "/issues", event);
        }
        sendSafe("/topic/feed", event);
        if (resolverEmail != null && !resolverEmail.isBlank()) {
            sendUserSafe(resolverEmail, "/queue/issues", event);
        }
        if (reporterEmail != null && !reporterEmail.isBlank()) {
            sendUserSafe(reporterEmail, "/queue/issues", event);
        }
    }

    public void publishIssueVoted(IssueResponse issue, String reporterEmail) {
        if (issue == null) return;
        WebSocketEvent<IssueResponse> event = WebSocketEvent.of("ISSUE_VOTED", issue);

        sendSafe("/topic/feed", event);
        if (issue.getCategoryId() != null) {
            sendSafe("/topic/categories/" + issue.getCategoryId() + "/issues", event);
        }
        if (reporterEmail != null && !reporterEmail.isBlank()) {
            sendUserSafe(reporterEmail, "/queue/issues", event);
        }
    }

    public void publishNotification(String userEmail, NotificationResponse notification) {
        if (userEmail == null || notification == null) return;
        WebSocketEvent<NotificationResponse> event = WebSocketEvent.of("NOTIFICATION_NEW", notification);
        sendUserSafe(userEmail, "/queue/notifications", event);
    }

    public void publishComment(Long issueId, Object comment) {
        if (issueId == null || comment == null) return;
        WebSocketEvent<Object> event = WebSocketEvent.of("COMMENT_ADDED", comment);
        sendSafe("/topic/issues/" + issueId + "/comments", event);
    }

    private void sendSafe(String destination, Object payload) {
        try {
            messagingTemplate.convertAndSend(destination, payload);
        } catch (Exception e) {
            log.warn("Failed to publish WebSocket message to destination {}: {}", destination, e.getMessage());
        }
    }

    private void sendUserSafe(String userEmail, String destination, Object payload) {
        try {
            messagingTemplate.convertAndSendToUser(userEmail, destination, payload);
        } catch (Exception e) {
            log.warn("Failed to publish WebSocket message to user {} destination {}: {}", userEmail, destination, e.getMessage());
        }
    }
}
