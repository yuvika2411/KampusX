package com.kampusx.issue.repository;

import com.kampusx.issue.entity.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Override
    @EntityGraph(attributePaths = {"categoryHead"})
    List<Category> findAll();

    @Override
    @EntityGraph(attributePaths = {"categoryHead"})
    Optional<Category> findById(Long id);

    Optional<Category> findByName(String name);
}