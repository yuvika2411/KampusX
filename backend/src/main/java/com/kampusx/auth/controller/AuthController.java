package com.kampusx.auth.controller;

import com.kampusx.auth.dto.*;
import com.kampusx.auth.entity.OtpPurpose;
import com.kampusx.auth.service.AuthService;
import com.kampusx.auth.service.EmailOtpService;
import com.kampusx.auth.service.RegistrationService;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.kampusx.auth.service.JwtService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailOtpService emailOtpService;
    private final RegistrationService registrationService;
    private final AuthService authService;



    @PostMapping("/register/request-otp")
    public ResponseEntity<String> requestRegistrationOtp(
            @RequestParam String email) {

        registrationService.requestRegistrationOtp(email);

        return ResponseEntity.ok("Registration OTP sent successfully");
    }

    @PostMapping("/register/complete")
    public ResponseEntity<String> completeRegistration(
            @RequestBody CompleteRegistrationRequest request) {

        registrationService.completeRegistration(request);

        return ResponseEntity.ok("Registration completed successfully");
    }

    @PostMapping("/login/request-otp")
    public ResponseEntity<String> requestLoginOtp(
            @RequestBody LoginOtpRequest request) {

        authService.requestLoginOtp(request);

        return ResponseEntity.ok("Login OTP sent successfully");
    }

    @PostMapping("/login/verify-otp")
    public ResponseEntity<LoginResponse> verifyLoginOtp(
            @RequestBody VerifyOtpRequest request) {

        return ResponseEntity.ok(
                authService.verifyLoginOtp(request)
        );
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<String> verifyRegistrationOtp(
            @RequestBody VerifyOtpRequest request) {

        emailOtpService.verifyOtp(
                request.getEmail(),
                request.getOtp(),
                OtpPurpose.REGISTRATION
        );

        return ResponseEntity.ok("Registration OTP verified successfully");
    }
}