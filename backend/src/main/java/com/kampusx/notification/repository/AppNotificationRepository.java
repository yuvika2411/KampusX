package com.kampusx.notification.repository;

import com.kampusx.notification.entity.AppNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppNotificationRepository
        extends JpaRepository<AppNotification, Long> {

    Page<AppNotification> findByUserId(Long userId, Pageable pageable);

    Optional<AppNotification> findByIdAndUserId(
            Long id,
            Long userId
    );

    long countByUserIdAndReadFalse(Long userId);
}