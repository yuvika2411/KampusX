package com.kampusx.issue.config;

import com.kampusx.issue.entity.Category;
import com.kampusx.issue.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CategoryDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {

        createIfNotExists("HOSTEL");
        createIfNotExists("MESS");
        createIfNotExists("CAMPUS_WIFI");
        createIfNotExists("ACADEMIC");
        createIfNotExists("LAB");
        createIfNotExists("CLASSROOM");
        createIfNotExists("WASHROOM");
        createIfNotExists("PARKING");
        createIfNotExists("MEDICAL_ROOM");
        createIfNotExists("LIBRARY");
        createIfNotExists("SPORTS");
        createIfNotExists("CAFETERIA");
    }

    private void createIfNotExists(String name) {

        if (categoryRepository.findByName(name).isEmpty()) {

            Category category = new Category();
            category.setName(name);

            categoryRepository.save(category);
        }
    }
}