package com.juku.repository;

import com.juku.entity.AcceptanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AcceptanceRecordRepository extends JpaRepository<AcceptanceRecord, Long> {
    List<AcceptanceRecord> findByTargetSchoolIdOrderByAcademicYearDesc(Long targetSchoolId);
    List<AcceptanceRecord> findByStudentId(Long studentId);
}
