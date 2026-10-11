package com.kampusx.auth.controller;

import com.kampusx.auth.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(
            @RequestParam String email
    ) {
        passwordResetService.requestOtp(email);

        return ResponseEntity.ok(
                Map.of("message", "If the account exists, an OTP has been sent")
        );
    }

    @PostMapping("/reset")
    public ResponseEntity<?> reset(
            @RequestBody ResetPasswordRequest request
    ) {
        passwordResetService.resetPassword(
                request.email(),
                request.otp(),
                request.newPassword(),
                request.confirmPassword()
        );

        return ResponseEntity.ok(
                Map.of("message", "Password reset successful")
        );
    }

    public record ResetPasswordRequest(
            String email,
            String otp,
            String newPassword,
            String confirmPassword
    ) {}
}