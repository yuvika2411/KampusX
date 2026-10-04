package com.kampusx.issue.dto;

import com.kampusx.issue.entity.IssuePriority;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateIssueRequest {

    private String title;
    private String description;

    private Long categoryId;
    private Long locationId;

    private IssuePriority priority;
    private Integer affectedUsers;
}