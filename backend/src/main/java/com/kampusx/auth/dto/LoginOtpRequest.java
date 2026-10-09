package com.kampusx.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginOtpRequest {

    private String email;
    private String password;
}