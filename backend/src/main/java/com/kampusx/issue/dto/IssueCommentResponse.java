package com.kampusx.issue.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IssueCommentResponse {

    private Long id;
    private String comment;
    private Long userId;
    private String userName;
}