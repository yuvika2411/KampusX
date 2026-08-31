package com.kampusx.issue.dto;

import com.kampusx.issue.entity.IssueCategory;
import com.kampusx.issue.entity.IssuePriority;
import com.kampusx.issue.entity.LocationType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateIssueRequest {

    private String title;
    private String description;
    private IssueCategory category;
    private LocationType locationType;
    private String location;
    private IssuePriority priority;
    private Integer affectedUsers;

    private Long reporterId;
}