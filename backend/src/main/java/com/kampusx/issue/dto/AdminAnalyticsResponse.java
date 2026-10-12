package com.kampusx.issue.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminAnalyticsResponse {

    private long totalIssues;
    private long reportedIssues;
    private long assignedIssues;
    private long inProgressIssues;
    private long resolvedIssues;
    private long closedIssues;
    private long reopenedIssues;
}