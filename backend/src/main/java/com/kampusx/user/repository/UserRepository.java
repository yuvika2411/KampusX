package com.kampusx.user.repository;

import com.kampusx.user.entity.Role;
import com.kampusx.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleAndActiveTrue(Role role);
}
