package com.kampusx.auth.controller;

import com.kampusx.auth.dto.CompleteRegistrationRequest;
import com.kampusx.auth.dto.LoginRequest;
import com.kampusx.auth.dto.LoginResponse;
import com.kampusx.auth.service.EmailOtpService;
import com.kampusx.auth.service.RegistrationService;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.kampusx.auth.service.JwtService;
import com.kampusx.auth.dto.VerifyOtpRequest;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailOtpService emailOtpService;
    private final RegistrationService registrationService;


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                token
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        emailOtpService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        return ResponseEntity.ok("OTP verified successfully");
    }

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
}