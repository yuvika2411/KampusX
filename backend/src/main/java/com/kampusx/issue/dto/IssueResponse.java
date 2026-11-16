package com.kampusx.issue.dto;

import com.kampusx.issue.entity.IssuePriority;
import com.kampusx.issue.entity.IssueStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class IssueResponse {

    private Long id;
    private String title;
    private String description;
    private String floorRoom;
    private LocalDateTime createdAt;

    private IssueStatus status;
    private IssuePriority priority;
    private Integer affectedUsers;

    private Long categoryId;
    private String categoryName;

    private Long locationId;
    private String locationName;

    private Long reporterId;
    private String reporterName;
    private long voteCount;
    private long commentCount;
    private boolean hasVoted;
}
