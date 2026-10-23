package com.kampusx.auth.service;

import com.kampusx.auth.entity.EmailOtp;
import com.kampusx.auth.entity.OtpPurpose;
import com.kampusx.auth.repository.EmailOtpRepository;
import com.kampusx.common.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.Random;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class EmailOtpService {

    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private static final int MAX_OTP_REQUESTS = 5;
    private static final Duration REQUEST_WINDOW = Duration.ofHours(1);

    private final ConcurrentHashMap<String, RequestWindow> requestWindows =
            new ConcurrentHashMap<>();

    private record RequestWindow(int count, LocalDateTime startedAt) {}

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Email is required");
        }

        String normalized = email.trim().toLowerCase(Locale.ROOT);

        if (!normalized.endsWith("@kiet.edu")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only KIET email addresses are allowed");
        }

        return normalized;
    }

    private void checkRequestLimit(String email, OtpPurpose purpose) {
        String key = purpose.name() + ":" + email;

        RequestWindow window = requestWindows.get(key);

        if (window != null
                && LocalDateTime.now(ZoneOffset.UTC).isBefore(
                window.startedAt().plus(REQUEST_WINDOW))
                && window.count() >= MAX_OTP_REQUESTS) {

            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "OTP request limit reached. Try again later.");
        }
    }

    private void recordOtpRequest(String email, OtpPurpose purpose) {
        String key = purpose.name() + ":" + email;

        requestWindows.compute(key, (k, old) -> {
            LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);

            if (old == null
                    || !now.isBefore(old.startedAt().plus(REQUEST_WINDOW))) {
                return new RequestWindow(1, now);
            }

            return new RequestWindow(old.count() + 1, old.startedAt());
        });
    }

    public String generateOtp(String email, OtpPurpose purpose) {

        String normalizedEmail = normalizeEmail(email);

        checkRequestLimit(normalizedEmail, purpose);

        Optional<EmailOtp> latestOtp =
                emailOtpRepository.findTopByEmailAndPurposeOrderByIdDesc(
                        normalizedEmail, purpose);

        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);

        if (latestOtp.isPresent()
                && latestOtp.get().getCreatedAt() != null
                && !latestOtp.get().getCreatedAt().isAfter(now)
                && latestOtp.get().getCreatedAt()
                .plusSeconds(60).isAfter(now)) {

            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait 60 seconds before requesting another OTP"
            );
        }

        String otp = String.format(
                "%06d", SECURE_RANDOM.nextInt(1_000_000));

        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(normalizedEmail);
        emailOtp.setOtp(passwordEncoder.encode(otp));
        emailOtp.setPurpose(purpose);
        emailOtp.setCreatedAt(now);
        emailOtp.setExpiresAt(now.plusMinutes(5));
        emailOtp.setUsed(false);
        emailOtp.setAttempts(0);

        emailService.sendOtpEmail(normalizedEmail, otp);
        emailOtpRepository.save(emailOtp);
        recordOtpRequest(normalizedEmail, purpose);

        return otp;
    }

    public void verifyOtp(
            String email,
            String otp,
            OtpPurpose purpose) {

        String normalizedEmail = normalizeEmail(email);

        if (otp == null || !otp.matches("\\d{6}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "OTP must contain exactly 6 digits");
        }

        EmailOtp emailOtp = emailOtpRepository
                .findTopByEmailAndPurposeOrderByIdDesc(
                        normalizedEmail,
                        purpose
                )
                .orElseThrow(() ->
                        new BadRequestException("OTP not found"));

        if (emailOtp.getAttempts() >= 5) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many OTP attempts"
            );
        }
        if (emailOtp.isUsed()) {
            throw new BadRequestException("OTP has already been used");
        }

        if (emailOtp.getExpiresAt()
                .isBefore(LocalDateTime.now(ZoneOffset.UTC))) {
            throw new BadRequestException("OTP has expired");
        }

        if (!passwordEncoder.matches(otp, emailOtp.getOtp())) {
            emailOtp.setAttempts(emailOtp.getAttempts() + 1);
            emailOtpRepository.save(emailOtp);

            throw new BadRequestException("Invalid OTP");
        }

        emailOtp.setUsed(true);
        emailOtpRepository.save(emailOtp);
    }
}