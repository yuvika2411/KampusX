package com.kampusx.auth.service;

import com.kampusx.auth.entity.EmailOtp;
import com.kampusx.auth.entity.OtpPurpose;
import com.kampusx.auth.repository.EmailOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailOtpService {

    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;

    public String generateOtp(String email, OtpPurpose purpose) {

        Optional<EmailOtp> latestOtp =
                emailOtpRepository.findTopByEmailAndPurposeOrderByIdDesc(
                        email.toLowerCase(),
                        purpose
                );

        if (latestOtp.isPresent()
                && latestOtp.get().getCreatedAt() != null
                && latestOtp.get().getCreatedAt()
                .plusSeconds(60)
                .isAfter(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Please wait 60 seconds before requesting another OTP"
            );
        }

        if (email == null || !email.toLowerCase().endsWith("@kiet.edu")) {
            throw new RuntimeException("Only KIET email addresses are allowed");
        }

        String otp = String.format("%06d", new Random().nextInt(1_000_000));

        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(email.toLowerCase());
        emailOtp.setOtp(otp);
        emailOtp.setPurpose(purpose);
        emailOtp.setCreatedAt(LocalDateTime.now());
        emailOtp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        emailOtp.setUsed(false);

        emailOtpRepository.save(emailOtp);

        emailService.sendOtpEmail(email, otp);

        return otp;
    }

    public void verifyOtp(
            String email,
            String otp,
            OtpPurpose purpose) {

        EmailOtp emailOtp = emailOtpRepository
                .findTopByEmailAndPurposeOrderByIdDesc(
                        email.toLowerCase(),
                        purpose
                )
                .orElseThrow(() ->
                        new RuntimeException("OTP not found"));

        if (emailOtp.getAttempts() >= 5) {
            throw new RuntimeException("Too many OTP attempts");
        }
        if (emailOtp.isUsed()) {
            throw new RuntimeException("OTP has already been used");
        }

        if (emailOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        if (!emailOtp.getOtp().equals(otp)) {
            emailOtp.setAttempts(emailOtp.getAttempts() + 1);
            emailOtpRepository.save(emailOtp);

            throw new RuntimeException("Invalid OTP");
        }

        emailOtp.setUsed(true);
        emailOtpRepository.save(emailOtp);
    }
}