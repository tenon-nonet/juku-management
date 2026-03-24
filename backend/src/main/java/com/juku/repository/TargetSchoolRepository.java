package com.juku.repository;

import com.juku.entity.TargetSchool;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TargetSchoolRepository extends JpaRepository<TargetSchool, Long> {
    List<TargetSchool> findBySchoolTypeOrderByDifficultyDesc(String schoolType);
    List<TargetSchool> findBySchoolNameContainingIgnoreCase(String name);
}
