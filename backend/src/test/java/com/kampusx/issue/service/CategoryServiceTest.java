package com.kampusx.issue.service;

import com.kampusx.common.BadRequestException;
import com.kampusx.common.ResourceNotFoundException;
import com.kampusx.issue.dto.CategoryResponse;
import com.kampusx.issue.entity.Category;
import com.kampusx.issue.repository.CategoryRepository;
import com.kampusx.user.entity.Role;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category category;
    private User categoryHeadUser;
    private User studentUser;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("CAMPUS_WIFI");

        categoryHeadUser = new User();
        categoryHeadUser.setId(7L);
        categoryHeadUser.setName("Tanishq");
        categoryHeadUser.setEmail("tanishq.2428cs233@kiet.edu");
        categoryHeadUser.setRole(Role.CATEGORY_HEAD);

        studentUser = new User();
        studentUser.setId(6L);
        studentUser.setName("Yuvika");
        studentUser.setEmail("yuvika.2428cs2163@kiet.edu");
        studentUser.setRole(Role.STUDENT);
    }

    @Test
    void getAllCategories_returnsMappedResponseWithHead() {
        category.setCategoryHead(categoryHeadUser);
        when(categoryRepository.findAll()).thenReturn(List.of(category));

        List<CategoryResponse> responses = categoryService.getAllCategories();

        assertThat(responses).hasSize(1);
        CategoryResponse res = responses.get(0);
        assertThat(res.getId()).isEqualTo(1L);
        assertThat(res.getName()).isEqualTo("CAMPUS_WIFI");
        assertThat(res.getCategoryHeadId()).isEqualTo(7L);
        assertThat(res.getCategoryHeadName()).isEqualTo("Tanishq");
        assertThat(res.getCategoryHeadEmail()).isEqualTo("tanishq.2428cs233@kiet.edu");
    }

    @Test
    void assignCategoryHead_success() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(userRepository.findById(7L)).thenReturn(Optional.of(categoryHeadUser));
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        CategoryResponse res = categoryService.assignCategoryHead(1L, 7L);

        assertThat(res.getId()).isEqualTo(1L);
        assertThat(res.getCategoryHeadId()).isEqualTo(7L);
        assertThat(res.getCategoryHeadName()).isEqualTo("Tanishq");
        verify(categoryRepository).save(category);
        assertThat(category.getCategoryHead()).isEqualTo(categoryHeadUser);
    }

    @Test
    void assignCategoryHead_categoryNotFound_throwsResourceNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.assignCategoryHead(99L, 7L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Category not found");
    }

    @Test
    void assignCategoryHead_userNotFound_throwsResourceNotFound() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.assignCategoryHead(1L, 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void assignCategoryHead_userNotCategoryHead_throwsBadRequest() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(userRepository.findById(6L)).thenReturn(Optional.of(studentUser));

        assertThatThrownBy(() -> categoryService.assignCategoryHead(1L, 6L))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("User is not a Category Head");
    }
}
