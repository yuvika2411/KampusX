package com.kampusx.user.controller;

import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
            String role
    ) {
        public static UserResponse from(User user) {
            return new UserResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole().name()
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
                        new RuntimeException("User not found")
                );

        if (request.role() == null) {
            throw new RuntimeException("Role is required");
        }

        String role = request.role().trim().toUpperCase();

        if (!List.of("STUDENT", "RESOLVER", "CATEGORY_HEAD")
                .contains(role)) {
            throw new RuntimeException("Invalid role");
        }

        // Prevent admin role changes through this endpoint.
        if ("ADMIN".equals(user.getRole().name())) {
            throw new RuntimeException(
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
}