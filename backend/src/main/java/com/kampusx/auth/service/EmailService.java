
package com.kampusx.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private final RestClient restClient;

    public EmailService(
            @Value("${brevo.api.key}") String apiKey) {

        this.restClient = RestClient.builder()
                .baseUrl("https://api.brevo.com/v3")
                .defaultHeader("api-key", apiKey)
                .build();
    }

    public void sendOtpEmail(String email, String otp) {

        String content =
                "Hello,\n\n"
                        + "Your KampusX verification OTP is: " + otp + "\n\n"
                        + "This OTP is valid for 5 minutes.\n"
                        + "Please do not share this OTP with anyone.\n\n"
                        + "Regards,\n"
                        + "KampusX Team";

        Map<String, Object> body = Map.of(
                "sender", Map.of(
                        "name", "KampusX",
                        "email", "kampusx2@gmail.com"
                ),
                "to", List.of(
                        Map.of("email", email)
                ),
                "subject", "KampusX Email Verification OTP",
                "textContent", content
        );

        restClient.post()
                .uri("/smtp/email")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }
}
