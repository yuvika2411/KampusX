package com.kampusx.issue.dto;

import com.kampusx.issue.entity.IssueCategory;
import com.kampusx.issue.entity.IssuePriority;
import com.kampusx.issue.entity.IssueStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IssueResponse {

    private Long id;
    private String title;
    private String description;
    private IssueStatus status;
    private IssuePriority priority;
    private Integer affectedUsers;
    private IssueCategory category;
    private String location;
    private Long reporterId;
}