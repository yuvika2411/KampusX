package com.kampusx.issue.controller;

import com.kampusx.issue.dto.CategoryResponse;
import com.kampusx.issue.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{categoryId}/head/{userId}")
    public ResponseEntity<CategoryResponse> assignCategoryHead(
            @PathVariable Long categoryId,
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                categoryService.assignCategoryHead(categoryId, userId)
        );
    }
}