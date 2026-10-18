package com.kampusx.user.controller;

import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.kampusx.user.entity.Role;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import com.kampusx.common.BadRequestException;
import com.kampusx.common.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    public record UserResponse(
            Long id,
            String name,
            String email,
            String role,
            boolean active
    ) {
        public static UserResponse from(User user) {
            return new UserResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole().name(),
                    user.isActive()
            );
        }
    }

    public record ChangeRoleRequest(String role) {}

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<?> changeRole(
            @PathVariable Long userId,
            @RequestBody ChangeRoleRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        if (request.role() == null) {
            throw new BadRequestException("Role is required");
        }

        String role = request.role().trim().toUpperCase();

        if (!List.of("STUDENT", "RESOLVER", "CATEGORY_HEAD")
                .contains(role)) {
            throw new BadRequestException("Invalid role");
        }

        // Prevent admin role changes through this endpoint.
        if ("ADMIN".equals(user.getRole().name())) {
            throw new AccessDeniedException(
                    "Cannot change an admin's role"
            );
        }

        user.setRole(
                com.kampusx.user.entity.Role.valueOf(role)
        );

        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of("message", "User role updated successfully")
        );
    }

    @PutMapping("/{userId}/deactivate")
    public ResponseEntity<?> deactivate(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (user.getEmail().equals(authentication.getName())
                || user.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Cannot deactivate an admin account");
        }

        user.setActive(false);
        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of("message", "User deactivated successfully"));
    }

    @PutMapping("/{userId}/reactivate")
    public ResponseEntity<?> reactivate(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        user.setActive(true);
        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of("message", "User reactivated successfully"));
    }
}