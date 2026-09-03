package com.kampusx.issue.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryResponse {

    private Long id;
    private String name;

    private Long categoryHeadId;
    private String categoryHeadName;
    private String categoryHeadEmail;
}