package com.kampusx.issue;

import com.kampusx.auth.service.JwtService;
import com.kampusx.issue.service.IssueService;
import com.kampusx.user.entity.Role;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.kampusx.common.ResourceNotFoundException;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none"
})
@AutoConfigureMockMvc
class IssueSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private IssueService issueService;

    private String studentToken() {
        User student = new User();
        student.setId(100L);
        student.setName("Test Student");
        student.setEmail("test@kiet.edu");
        student.setRole(Role.STUDENT);
        student.setActive(true);

        when(userRepository.findByEmail("test@kiet.edu"))
                .thenReturn(Optional.of(student));

        return jwtService.generateToken(student.getEmail());
    }

    @Test
    void missingIssueReturns404() throws Exception {
        String token = studentToken();

        when(issueService.getIssueById(99999L))
                .thenThrow(new ResourceNotFoundException("Issue not found"));

        mockMvc.perform(get("/api/issues/99999")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void studentCannotEditIssue() throws Exception {
        String token = studentToken();

        mockMvc.perform(put("/api/issues/19")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isForbidden());
    }
}