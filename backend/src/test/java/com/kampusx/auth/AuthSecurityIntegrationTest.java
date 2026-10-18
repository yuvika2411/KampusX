package com.kampusx.auth;

import com.kampusx.auth.service.JwtService;
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

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none"
})
@AutoConfigureMockMvc
class AuthSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    private User createUser(Role role, boolean active) {
        User user = new User();
        user.setId(100L);
        user.setName("Test User");
        user.setEmail("test@kiet.edu");
        user.setRole(role);
        user.setActive(active);
        return user;
    }

    @Test
    void adminWithoutJwtReturns401() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidJwtReturns401() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer invalid.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void studentCannotAccessAdminApi() throws Exception {
        User student = createUser(Role.STUDENT, true);
        when(userRepository.findByEmail("test@kiet.edu"))
                .thenReturn(Optional.of(student));

        String token = jwtService.generateToken(student.getEmail());

        mockMvc.perform(get("/api/admin/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void deactivatedUserJwtReturns401() throws Exception {
        User inactive = createUser(Role.STUDENT, false);
        when(userRepository.findByEmail("test@kiet.edu"))
                .thenReturn(Optional.of(inactive));

        String token = jwtService.generateToken(inactive.getEmail());

        mockMvc.perform(get("/api/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void validAdminJwtCanAccessAdminApi() throws Exception {
        User admin = createUser(Role.ADMIN, true);
        when(userRepository.findByEmail("test@kiet.edu"))
                .thenReturn(Optional.of(admin));

        String token = jwtService.generateToken(admin.getEmail());

        mockMvc.perform(get("/api/admin/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());
    }
}