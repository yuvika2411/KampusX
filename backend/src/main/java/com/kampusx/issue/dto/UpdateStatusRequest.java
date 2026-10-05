package com.kampusx.issue.dto;

import com.kampusx.issue.entity.IssueStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateStatusRequest {
    private IssueStatus status;
}
