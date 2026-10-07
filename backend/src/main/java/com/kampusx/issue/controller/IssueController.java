package com.kampusx.issue.controller;

import com.kampusx.issue.dto.CreateIssueRequest;
import com.kampusx.issue.dto.IssueResponse;
import com.kampusx.issue.dto.UpdateStatusRequest;
import com.kampusx.issue.service.IssueService;
import com.kampusx.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.kampusx.user.repository.UserRepository;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final UserRepository userRepository;

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(
            @RequestBody CreateIssueRequest request) {

        return ResponseEntity.ok(
                issueService.createIssue(request)
        );
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<IssueResponse>> getAllIssues() {
        return ResponseEntity.ok(issueService.getAllIssues());
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/my")
    public ResponseEntity<List<IssueResponse>> getMyIssues(
            Authentication authentication) {

        return ResponseEntity.ok(
                issueService.getMyIssues(authentication.getName())
        );
    }

    @GetMapping("/category-head")
    @PreAuthorize("hasRole('CATEGORY_HEAD')")
    public ResponseEntity<List<IssueResponse>> getIssuesForCategoryHead(
            Authentication authentication) {

        String email = authentication.getName();

        User categoryHead = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                issueService.getIssuesForCategoryHead(categoryHead.getId())
        );
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<IssueResponse> getIssueById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                issueService.getIssueById(id)
        );
    }

    @PreAuthorize("hasAnyRole('CATEGORY_HEAD', 'RESOLVER', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable Long id,
            @RequestBody CreateIssueRequest request) {

        return ResponseEntity.ok(
                issueService.updateIssue(id, request)
        );
    }

    @PreAuthorize("hasRole('CATEGORY_HEAD')")
    @PutMapping("/{issueId}/resolver/{resolverId}")
    public ResponseEntity<IssueResponse> assignResolver(
            @PathVariable Long issueId,
            @PathVariable Long resolverId,
            Authentication authentication) {

        String email = authentication.getName();

        User categoryHead = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Category Head not found"));

        return ResponseEntity.ok(
                issueService.assignResolver(
                        issueId,
                        resolverId,
                        categoryHead.getId()
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
    }

    @PreAuthorize("hasRole('RESOLVER')")
    @PutMapping("/{id}/status")
    public ResponseEntity<IssueResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                issueService.updateStatus(
                        id,
                        request.getStatus(),
                        authentication.getName()
                )
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/{id}/close")
    public ResponseEntity<IssueResponse> closeIssue(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                issueService.closeIssue(
                        id,
                        authentication.getName()
                )
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/{id}/reopen")
    public ResponseEntity<IssueResponse> reopenIssue(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                issueService.reopenIssue(
                        id,
                        authentication.getName()
                )
        );
    }

    @PreAuthorize("hasRole('RESOLVER')")
    @GetMapping("/assigned")
    public ResponseEntity<List<IssueResponse>> getAssignedIssues(
            Authentication authentication) {

        return ResponseEntity.ok(
                issueService.getAssignedIssues(authentication.getName())
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/feed")
    public ResponseEntity<List<IssueResponse>> getStudentFeed() {

        return ResponseEntity.ok(
                issueService.getAllIssues()
        );
    }
}