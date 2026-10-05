package com.kampusx.issue.controller;

import com.kampusx.issue.service.IssueVoteService;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueVoteController {

    private final IssueVoteService issueVoteService;
    private final UserRepository userRepository;

    @PostMapping("/{issueId}/vote")
    public ResponseEntity<String> vote(
            @PathVariable Long issueId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        issueVoteService.vote(issueId, user);

        return ResponseEntity.ok("Marked as affected");
    }

    @GetMapping("/{issueId}/votes")
    public ResponseEntity<Long> getVoteCount(
            @PathVariable Long issueId) {

        return ResponseEntity.ok(
                issueVoteService.getVoteCount(issueId)
        );
    }
}