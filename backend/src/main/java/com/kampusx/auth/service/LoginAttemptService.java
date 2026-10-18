package com.kampusx.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

import static org.springframework.http.HttpStatus.TOO_MANY_REQUESTS;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, AttemptInfo> attempts =
            new ConcurrentHashMap<>();

    private record AttemptInfo(int count, Instant lockedUntil) {}

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public void checkBlocked(String email) {
        String key = normalize(email);
        AttemptInfo info = attempts.get(key);

        if (info == null) {
            return;
        }

        if (info.lockedUntil() != null) {
            if (Instant.now().isBefore(info.lockedUntil())) {
                throw new ResponseStatusException(
                        TOO_MANY_REQUESTS,
                        "Too many failed login attempts. Try again after 15 minutes."
                );
            }

            attempts.remove(key, info);
        }
    }

    public void recordFailure(String email) {
        String key = normalize(email);

        attempts.compute(key, (k, old) -> {
            Instant now = Instant.now();

            if (old == null ||
                    (old.lockedUntil() != null &&
                            !now.isBefore(old.lockedUntil()))) {
                return new AttemptInfo(1, null);
            }

            int count = old.count() + 1;

            if (count >= MAX_ATTEMPTS) {
                return new AttemptInfo(count, now.plus(LOCK_DURATION));
            }

            return new AttemptInfo(count, null);
        });
    }

    public void reset(String email) {
        attempts.remove(normalize(email));
    }
}