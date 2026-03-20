package com.juku.repository;

import com.juku.entity.ExamType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamTypeRepository extends JpaRepository<ExamType, Long> {
    List<ExamType> findAllByOrderBySortOrderAsc();
}
