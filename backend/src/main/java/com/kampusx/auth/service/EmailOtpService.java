package com.kampusx.auth.service;

import com.kampusx.auth.entity.EmailOtp;
import com.kampusx.auth.repository.EmailOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailOtpService {

    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;

    public String generateOtp(String email) {

        if (email == null || !email.toLowerCase().endsWith("@kiet.edu")) {
            throw new RuntimeException("Only KIET email addresses are allowed");
        }

        String otp = String.format("%06d", new Random().nextInt(1_000_000));

        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(email);
        emailOtp.setOtp(otp);
        emailOtp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        emailOtp.setUsed(false);
        emailOtpRepository.save(emailOtp);

        emailService.sendOtpEmail(email, otp);

        return otp;
    }

    public void verifyOtp(String email, String otp) {

        EmailOtp emailOtp = emailOtpRepository
                .findTopByEmailOrderByIdDesc(email)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (emailOtp.isUsed()) {
            throw new RuntimeException("OTP has already been used");
        }

        if (emailOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        if (!emailOtp.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        emailOtp.setUsed(true);
        emailOtpRepository.save(emailOtp);
    }
}