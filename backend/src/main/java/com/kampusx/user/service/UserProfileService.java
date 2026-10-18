package com.kampusx.user.service;

import com.kampusx.common.ResourceNotFoundException;

import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.kampusx.common.BadRequestException;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private User currentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    public void updateName(String name) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Name cannot be empty");
        }

        User user = currentUser();
        user.setName(name.trim());
        userRepository.save(user);
    }

    public void changePassword(
            String currentPassword,
            String newPassword
    ) {
        User user = currentUser();

        if (!passwordEncoder.matches(
                currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new BadRequestException(
                    "New password must be at least 8 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}