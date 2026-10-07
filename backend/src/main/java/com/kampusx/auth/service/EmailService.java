package com.kampusx.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String email, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("KampusX Email Verification OTP");

        message.setText(
                "Hello,\n\n"
                        + "Your KampusX verification OTP is: " + otp + "\n\n"
                        + "This OTP is valid for 5 minutes.\n"
                        + "Please do not share this OTP with anyone.\n\n"
                        + "Regards,\n"
                        + "KampusX Team"
        );

        mailSender.send(message);
    }
}