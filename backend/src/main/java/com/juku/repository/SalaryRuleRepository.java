package com.juku.repository;

import com.juku.entity.SalaryRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalaryRuleRepository extends JpaRepository<SalaryRule, Long> {
    List<SalaryRule> findByStaffIdOrderByEffectiveFromDesc(Long staffId);
}
