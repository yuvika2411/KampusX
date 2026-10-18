package com.kampusx.auth.service;

import com.kampusx.auth.dto.CompleteRegistrationRequest;
import com.kampusx.auth.entity.EmailOtp;
import com.kampusx.auth.entity.OtpPurpose;
import com.kampusx.auth.repository.EmailOtpRepository;
import com.kampusx.user.entity.Role;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import com.kampusx.common.BadRequestException;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepository;
    private final EmailOtpService emailOtpService;
    private final EmailOtpRepository emailOtpRepository;
    private final PasswordEncoder passwordEncoder;

    public void requestRegistrationOtp(String email) {

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required"
            );
        }

        email = email.trim().toLowerCase(java.util.Locale.ROOT);

        if (!email.endsWith("@kiet.edu")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only KIET email addresses are allowed"
            );
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        emailOtpService.generateOtp(email, OtpPurpose.REGISTRATION);
    }



    @Transactional
    public void completeRegistration(CompleteRegistrationRequest request) {

        if (request == null || request.getEmail() == null
                || request.getEmail().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required"
            );
        }

        String email = request.getEmail()
                .trim()
                .toLowerCase(java.util.Locale.ROOT);

        if (!email.endsWith("@kiet.edu")) {
            throw new BadRequestException("Only KIET email addresses are allowed");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        EmailOtp verifiedOtp = emailOtpRepository
                .findTopByEmailAndPurposeOrderByIdDesc(
                        email,
                        OtpPurpose.REGISTRATION
                )
                .orElseThrow(() -> new BadRequestException("Email is not verified"));

        if (!verifiedOtp.isUsed()) {
            throw new BadRequestException("Email is not verified");
        }

        if (verifiedOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP verification has expired");
        }

        if (verifiedOtp.isRegistrationCompleted()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Registration OTP has already been consumed");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);

        userRepository.save(user);
        verifiedOtp.setRegistrationCompleted(true);
        emailOtpRepository.save(verifiedOtp);
    }
}