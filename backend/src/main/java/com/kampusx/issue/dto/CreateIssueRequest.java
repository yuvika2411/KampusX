package com.kampusx.issue.dto;

import com.kampusx.issue.entity.IssueCategory;
import com.kampusx.issue.entity.IssuePriority;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateIssueRequest {

    private String title;
    private String description;
    private IssueCategory category;
    private String location;
    private IssuePriority priority;
    private Integer affectedUsers;

    private Long reporterId;
}