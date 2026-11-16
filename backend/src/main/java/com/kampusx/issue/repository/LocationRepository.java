package com.kampusx.issue.repository;

import com.kampusx.issue.entity.Location;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {

    @Override
    @EntityGraph(attributePaths = {"locationType"})
    List<Location> findAll();
}
