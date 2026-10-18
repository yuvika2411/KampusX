package com.kampusx.auth.service;

import com.kampusx.auth.entity.OtpPurpose;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import com.kampusx.common.BadRequestException;

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

        emailOtpService.generateOtp(
                email, OtpPurpose.PASSWORD_RESET
        );
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
            throw new BadRequestException(
                    "Password must contain at least 8 characters"
            );
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new BadRequestException("Passwords do not match");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BadRequestException("Invalid reset request")
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
            throw new BadRequestException("Email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}