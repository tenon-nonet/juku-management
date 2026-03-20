package com.juku.repository;

import com.juku.entity.Guardian;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuardianRepository extends JpaRepository<Guardian, Long> {
    List<Guardian> findByFullNameContainingIgnoreCase(String name);
}
