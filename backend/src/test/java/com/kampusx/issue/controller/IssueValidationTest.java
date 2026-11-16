package com.kampusx.issue.controller;

import com.kampusx.common.GlobalExceptionHandler;
import com.kampusx.issue.dto.IssueResponse;
import com.kampusx.issue.service.IssueService;
import com.kampusx.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class IssueValidationTest {

    private MockMvc mockMvc;

    @Mock
    private IssueService issueService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private IssueController issueController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(issueController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createIssue_missingFloorRoom_returns400WithClearMessage() throws Exception {
        String jsonPayload = """
            {
                "title": "Wi-Fi AP dropped connection",
                "description": "Signal drops intermittently during lectures",
                "categoryId": 1,
                "locationId": 2,
                "floorRoom": ""
            }
            """;

        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Floor / Room is required"));
    }

    @Test
    void createIssue_missingTitle_returns400WithClearMessage() throws Exception {
        String jsonPayload = """
            {
                "title": "   ",
                "description": "Signal drops intermittently during lectures",
                "categoryId": 1,
                "locationId": 2,
                "floorRoom": "2nd Floor, Room 204"
            }
            """;

        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Issue title is required"));
    }

    @Test
    void createIssue_validInput_returns200WithCreatedFields() throws Exception {
        String jsonPayload = """
            {
                "title": "Wi-Fi AP dropped connection",
                "description": "Signal drops intermittently during lectures",
                "categoryId": 1,
                "locationId": 2,
                "floorRoom": "2nd Floor, Room 204"
            }
            """;

        IssueResponse mockResponse = new IssueResponse();
        mockResponse.setId(101L);
        mockResponse.setTitle("Wi-Fi AP dropped connection");
        mockResponse.setDescription("Signal drops intermittently during lectures");
        mockResponse.setFloorRoom("2nd Floor, Room 204");
        mockResponse.setCreatedAt(LocalDateTime.of(2026, 11, 16, 10, 30, 0));
        mockResponse.setVoteCount(0);
        mockResponse.setCommentCount(0);
        mockResponse.setHasVoted(false);

        when(issueService.createIssue(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.floorRoom").value("2nd Floor, Room 204"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty())
                .andExpect(jsonPath("$.voteCount").value(0))
                .andExpect(jsonPath("$.commentCount").value(0))
                .andExpect(jsonPath("$.hasVoted").value(false));
    }
}
