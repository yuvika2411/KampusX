package com.kampusx.issue.controller;

import com.kampusx.issue.dto.CreateCommentRequest;
import com.kampusx.issue.dto.IssueCommentResponse;
import com.kampusx.issue.service.IssueCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueCommentController {

    private final IssueCommentService issueCommentService;

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{issueId}/comments")
    public ResponseEntity<IssueCommentResponse> addComment(
            @PathVariable Long issueId,
            @RequestBody CreateCommentRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                issueCommentService.addComment(
                        issueId,
                        authentication.getName(),
                        request
                )
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/{issueId}/comments")
    public ResponseEntity<List<IssueCommentResponse>> getComments(
            @PathVariable Long issueId) {

        return ResponseEntity.ok(
                issueCommentService.getComments(issueId)
        );
    }
}