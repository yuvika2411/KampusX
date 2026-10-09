package com.kampusx.auth.service;

import com.kampusx.auth.dto.CompleteRegistrationRequest;
import com.kampusx.auth.entity.EmailOtp;
import com.kampusx.auth.entity.OtpPurpose;
import com.kampusx.auth.repository.EmailOtpRepository;
import com.kampusx.user.entity.Role;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepository;
    private final EmailOtpService emailOtpService;
    private final EmailOtpRepository emailOtpRepository;
    private final PasswordEncoder passwordEncoder;

    public void requestRegistrationOtp(String email) {

        if (email == null || !email.toLowerCase().endsWith("@kiet.edu")) {
            throw new RuntimeException("Only KIET email addresses are allowed");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered");
        }

        emailOtpService.generateOtp(email, OtpPurpose.REGISTRATION);
    }

    public void completeRegistration(CompleteRegistrationRequest request) {

        String email = request.getEmail().toLowerCase();

        if (!email.endsWith("@kiet.edu")) {
            throw new RuntimeException("Only KIET email addresses are allowed");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        EmailOtp verifiedOtp = emailOtpRepository
                .findTopByEmailAndPurposeOrderByIdDesc(
                        email,
                        OtpPurpose.REGISTRATION
                )
                .orElseThrow(() -> new RuntimeException("Email is not verified"));

        if (!verifiedOtp.isUsed()) {
            throw new RuntimeException("Email is not verified");
        }

        if (verifiedOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP verification has expired");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);

        userRepository.save(user);
    }
}