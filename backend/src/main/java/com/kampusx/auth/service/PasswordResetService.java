package com.kampusx.auth.service;

import com.kampusx.auth.entity.OtpPurpose;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final EmailOtpService emailOtpService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public void requestOtp(String email) {
        email = normalize(email);

        // Avoid exposing whether an account exists.
        if (userRepository.findByEmail(email).isEmpty()) {
            return;
        }

        String otp = emailOtpService.generateOtp(
                email, OtpPurpose.PASSWORD_RESET
        );

        emailService.sendOtpEmail(email, otp);
    }

    @Transactional
    public void resetPassword(
            String email,
            String otp,
            String newPassword,
            String confirmPassword
    ) {
        email = normalize(email);

        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException(
                    "Password must contain at least 8 characters"
            );
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("Passwords do not match");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Invalid reset request")
                );

        // Validates expiry, attempts, purpose and marks OTP used.
        emailOtpService.verifyOtp(
                email, otp, OtpPurpose.PASSWORD_RESET
        );

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private String normalize(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}