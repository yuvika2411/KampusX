package com.kampusx.issue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateIssueRequest {

    @NotBlank(message = "Issue title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Detailed description is required")
    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Location is required")
    private Long locationId;

    @NotBlank(message = "Floor / Room is required")
    @Size(max = 100, message = "Floor / Room must not exceed 100 characters")
    private String floorRoom;
}
