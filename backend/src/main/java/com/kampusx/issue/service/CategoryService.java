package com.kampusx.issue.service;

import com.kampusx.issue.dto.CategoryResponse;
import com.kampusx.issue.entity.Category;
import com.kampusx.issue.repository.CategoryRepository;
import com.kampusx.user.entity.Role;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse assignCategoryHead(Long categoryId, Long userId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.CATEGORY_HEAD) {
            throw new RuntimeException("User is not a Category Head");
        }

        category.setCategoryHead(user);

        Category savedCategory = categoryRepository.save(category);

        return toResponse(savedCategory);
    }

    private CategoryResponse toResponse(Category category) {

        CategoryResponse response = new CategoryResponse();

        response.setId(category.getId());
        response.setName(category.getName());

        if (category.getCategoryHead() != null) {
            response.setCategoryHeadId(category.getCategoryHead().getId());
            response.setCategoryHeadName(category.getCategoryHead().getName());
            response.setCategoryHeadEmail(category.getCategoryHead().getEmail());
        }

        return response;
    }
}