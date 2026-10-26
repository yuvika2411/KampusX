package com.kampusx.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private final RestClient restClient;

    public EmailService(@Value("${brevo.api.key}") String apiKey) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);   // 5 seconds to connect
        factory.setReadTimeout(10000);     // 10 seconds to get a response

        this.restClient = RestClient.builder()
                .requestFactory(factory)
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

        try {
            restClient.post()
                    .uri("/smtp/email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();

            System.out.println("Brevo OTP request accepted for: " + email);

        } catch (RestClientResponseException e) {
            // Brevo responded with an error (400, 401, 403, etc.)
            System.err.println("Brevo status: " + e.getStatusCode());
            System.err.println("Brevo body: " + e.getResponseBodyAsString());
            throw e;

        } catch (Exception e) {
            // Network problems, timeouts, DNS, etc.
            System.err.println("Brevo request failed: " + e);
            throw e;
        }
    }
}