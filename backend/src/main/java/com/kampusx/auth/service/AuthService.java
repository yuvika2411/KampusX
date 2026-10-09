package com.kampusx.auth.service;

import com.kampusx.auth.dto.LoginOtpRequest;
import com.kampusx.auth.dto.LoginResponse;
import com.kampusx.auth.dto.VerifyOtpRequest;
import com.kampusx.auth.entity.OtpPurpose;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailOtpService emailOtpService;
    private final JwtService jwtService;

    public void requestLoginOtp(LoginOtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid email or password");
        }

        emailOtpService.generateOtp(user.getEmail(), OtpPurpose.LOGIN);
    }
    public LoginResponse verifyLoginOtp(VerifyOtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        emailOtpService.verifyOtp(
                request.getEmail(),
                request.getOtp(),
                OtpPurpose.LOGIN
        );

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                token
        );
    }

}