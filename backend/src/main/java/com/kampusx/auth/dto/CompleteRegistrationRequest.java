package com.kampusx.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompleteRegistrationRequest {

    private String name;
    private String email;
    private String password;
    private String confirmPassword;
}