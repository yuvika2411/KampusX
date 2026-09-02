package com.kampusx.issue.dto;

import com.kampusx.issue.entity.IssuePriority;
import com.kampusx.issue.entity.IssueStatus;
import com.kampusx.issue.entity.LocationType;
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

    private Long categoryId;
    private String categoryName;

    private LocationType locationType;
    private String location;

    private Long reporterId;
}