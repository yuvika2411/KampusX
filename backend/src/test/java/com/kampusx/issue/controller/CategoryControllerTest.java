package com.kampusx.issue.controller;

import com.kampusx.common.BadRequestException;
import com.kampusx.common.GlobalExceptionHandler;
import com.kampusx.common.ResourceNotFoundException;
import com.kampusx.issue.dto.CategoryResponse;
import com.kampusx.issue.service.CategoryService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(categoryController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getAllCategories_returns200() throws Exception {
        CategoryResponse cat = new CategoryResponse();
        cat.setId(1L);
        cat.setName("CAMPUS_WIFI");
        cat.setCategoryHeadId(7L);
        cat.setCategoryHeadName("Tanishq");

        when(categoryService.getAllCategories()).thenReturn(List.of(cat));

        mockMvc.perform(get("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("CAMPUS_WIFI"))
                .andExpect(jsonPath("$[0].categoryHeadId").value(7))
                .andExpect(jsonPath("$[0].categoryHeadName").value("Tanishq"));
    }

    @Test
    void assignCategoryHead_success_returns200() throws Exception {
        CategoryResponse cat = new CategoryResponse();
        cat.setId(1L);
        cat.setName("CAMPUS_WIFI");
        cat.setCategoryHeadId(7L);
        cat.setCategoryHeadName("Tanishq");

        when(categoryService.assignCategoryHead(1L, 7L)).thenReturn(cat);

        mockMvc.perform(put("/api/categories/1/head/7")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("CAMPUS_WIFI"))
                .andExpect(jsonPath("$.categoryHeadId").value(7))
                .andExpect(jsonPath("$.categoryHeadName").value("Tanishq"));
    }

    @Test
    void assignCategoryHead_notCategoryHead_returns400WithReadableError() throws Exception {
        when(categoryService.assignCategoryHead(1L, 6L))
                .thenThrow(new BadRequestException("User is not a Category Head"));

        mockMvc.perform(put("/api/categories/1/head/6")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("User is not a Category Head"));
    }

    @Test
    void assignCategoryHead_categoryNotFound_returns404() throws Exception {
        when(categoryService.assignCategoryHead(999L, 7L))
                .thenThrow(new ResourceNotFoundException("Category not found"));

        mockMvc.perform(put("/api/categories/999/head/7")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Category not found"));
    }

    @Test
    void assignCategoryHead_userNotFound_returns404() throws Exception {
        when(categoryService.assignCategoryHead(1L, 999L))
                .thenThrow(new ResourceNotFoundException("User not found"));

        mockMvc.perform(put("/api/categories/1/head/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("User not found"));
    }
}
