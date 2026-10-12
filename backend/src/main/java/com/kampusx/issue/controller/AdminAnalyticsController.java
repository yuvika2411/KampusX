package com.kampusx.issue.controller;

import com.kampusx.issue.dto.AdminAnalyticsResponse;
import com.kampusx.issue.entity.IssueStatus;
import com.kampusx.issue.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.kampusx.issue.dto.AnalyticsGroupResponse;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final IssueRepository issueRepository;

    @GetMapping
    public AdminAnalyticsResponse getAnalytics() {

        return new AdminAnalyticsResponse(
                issueRepository.count(),
                issueRepository.countByStatus(IssueStatus.REPORTED),
                issueRepository.countByStatus(IssueStatus.ASSIGNED),
                issueRepository.countByStatus(IssueStatus.IN_PROGRESS),
                issueRepository.countByStatus(IssueStatus.RESOLVED),
                issueRepository.countByStatus(IssueStatus.CLOSED),
                issueRepository.countByStatus(IssueStatus.REOPENED)
        );
    }

    @GetMapping("/categories")
    public List<AnalyticsGroupResponse> getCategoryAnalytics() {

        return issueRepository.countIssuesByCategory()
                .stream()
                .map(row -> new AnalyticsGroupResponse(
                        (Long) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue()
                ))
                .toList();
    }

    @GetMapping("/locations")
    public List<AnalyticsGroupResponse> getLocationAnalytics() {

        return issueRepository.countIssuesByLocation()
                .stream()
                .map(row -> new AnalyticsGroupResponse(
                        (Long) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue()
                ))
                .toList();
    }
}