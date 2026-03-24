package com.juku.repository;

import com.juku.entity.Guardian;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuardianRepository extends JpaRepository<Guardian, Long> {
    List<Guardian> findByFullNameContainingIgnoreCase(String name);
    Optional<Guardian> findByUsername(String username);
}
