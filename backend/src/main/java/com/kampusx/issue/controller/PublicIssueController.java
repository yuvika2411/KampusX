package com.kampusx.issue.controller;

import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.entity.IssueStatus;
import com.kampusx.issue.repository.IssueRepository;
import com.kampusx.issue.repository.IssueVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicIssueController {

    private final IssueRepository issueRepository;
    private final IssueVoteRepository issueVoteRepository;

    public record PublicStatsResponse(
            long totalIssues,
            long reported,
            long inProgress,
            long resolved
    ) {}

    public record PublicIssueSummary(
            Long id,
            String title,
            String status,
            String priority,
            String categoryName,
            String locationName,
            long voteCount
    ) {}

    @GetMapping("/stats")
    public ResponseEntity<PublicStatsResponse> getPublicStats() {
        long total = issueRepository.count();
        long reported = issueRepository.countByStatus(IssueStatus.REPORTED);
        long inProgress = issueRepository.countByStatus(IssueStatus.IN_PROGRESS);
        long resolved = issueRepository.countByStatus(IssueStatus.RESOLVED)
                + issueRepository.countByStatus(IssueStatus.CLOSED);

        return ResponseEntity.ok(
                new PublicStatsResponse(total, reported, inProgress, resolved)
        );
    }

    @GetMapping("/issues/recent")
    public ResponseEntity<List<PublicIssueSummary>> getRecentIssues() {
        var pageRequest = PageRequest.of(0, 5, Sort.by("id").descending());
        List<Issue> issues = issueRepository.findAll(pageRequest).getContent();

        List<PublicIssueSummary> result = issues.stream()
                .map(issue -> new PublicIssueSummary(
                        issue.getId(),
                        issue.getTitle(),
                        issue.getStatus() != null ? issue.getStatus().name() : "REPORTED",
                        issue.getPriority() != null ? issue.getPriority().name() : "LOW",
                        issue.getCategory() != null ? issue.getCategory().getName() : null,
                        issue.getLocation() != null ? issue.getLocation().getName() : null,
                        issueVoteRepository.countByIssueId(issue.getId())
                ))
                .toList();

        return ResponseEntity.ok(result);
    }
}
