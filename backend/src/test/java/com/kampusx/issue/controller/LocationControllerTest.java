package com.kampusx.issue.controller;

import com.kampusx.common.GlobalExceptionHandler;
import com.kampusx.issue.dto.LocationResponse;
import com.kampusx.issue.service.LocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class LocationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private LocationService locationService;

    @InjectMocks
    private LocationController locationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(locationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getAllLocations_returns200WithLocationsList() throws Exception {
        LocationResponse loc1 = new LocationResponse(1L, "A Block", "BLOCK");
        LocationResponse loc2 = new LocationResponse(2L, "Aryabhatt Hostel", "BOYS_HOSTEL");

        when(locationService.getAllLocations()).thenReturn(List.of(loc1, loc2));

        mockMvc.perform(get("/api/locations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("A Block"))
                .andExpect(jsonPath("$[0].locationType").value("BLOCK"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Aryabhatt Hostel"))
                .andExpect(jsonPath("$[1].locationType").value("BOYS_HOSTEL"));
    }
}
