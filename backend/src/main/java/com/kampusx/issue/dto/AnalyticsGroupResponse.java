package com.kampusx.issue.dto;

public record AnalyticsGroupResponse(
        Long id,
        String name,
        Long issueCount
) {
}