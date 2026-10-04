package com.kampusx.issue.repository;

import com.kampusx.issue.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
}