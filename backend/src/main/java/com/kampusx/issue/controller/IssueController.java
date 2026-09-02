package com.kampusx.issue.controller;

import com.kampusx.issue.dto.CreateIssueRequest;
import com.kampusx.issue.dto.IssueResponse;
import com.kampusx.issue.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

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

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
    }
}