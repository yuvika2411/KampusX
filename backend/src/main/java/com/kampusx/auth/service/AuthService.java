package com.kampusx.auth.service;

import com.kampusx.auth.dto.LoginOtpRequest;
import com.kampusx.auth.dto.LoginResponse;
import com.kampusx.auth.dto.VerifyOtpRequest;
import com.kampusx.auth.entity.OtpPurpose;
import com.kampusx.common.BadRequestException;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailOtpService emailOtpService;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;

    public LoginResponse verifyLoginOtp(VerifyOtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BadRequestException("Invalid email or password"));

        if (!user.isActive()) {
            throw new BadRequestException("Account is deactivated");
        }

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

    public void requestLoginOtp(LoginOtpRequest request) {

        String email = request.getEmail();

        if (email == null || email.isBlank()
                || request.getPassword() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email and password are required"
            );
        }

        email = email.trim().toLowerCase(Locale.ROOT);

        loginAttemptService.checkBlocked(email);

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null || !passwordEncoder.matches(
                request.getPassword(), user.getPassword())) {

            loginAttemptService.recordFailure(email);

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        if (!user.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Account is deactivated"
            );
        }

        emailOtpService.generateOtp(
                user.getEmail(),
                OtpPurpose.LOGIN
        );

        loginAttemptService.reset(email);
    }

}