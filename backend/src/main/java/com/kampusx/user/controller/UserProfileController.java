package com.kampusx.user.controller;

import com.kampusx.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    public record UpdateNameRequest(String name) {}

    public record ChangePasswordRequest(
            String currentPassword,
            String newPassword
    ) {}

    @PutMapping("/name")
    public ResponseEntity<?> updateName(
            @RequestBody UpdateNameRequest request
    ) {
        userProfileService.updateName(request.name());

        return ResponseEntity.ok(
                Map.of("message", "Profile updated successfully")
        );
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request
    ) {
        userProfileService.changePassword(
                request.currentPassword(),
                request.newPassword()
        );

        return ResponseEntity.ok(
                Map.of("message", "Password changed successfully")
        );
    }
}