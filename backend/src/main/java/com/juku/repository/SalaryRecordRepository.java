package com.juku.repository;

import com.juku.entity.SalaryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SalaryRecordRepository extends JpaRepository<SalaryRecord, Long> {
    @Query("SELECT r FROM SalaryRecord r WHERE r.salaryMonth = :month ORDER BY r.staff.fullName ASC")
    List<SalaryRecord> findBySalaryMonth(@org.springframework.data.repository.query.Param("month") String month);
    List<SalaryRecord> findByStaffIdOrderBySalaryMonthDesc(Long staffId);
    Optional<SalaryRecord> findByStaffIdAndSalaryMonth(Long staffId, String salaryMonth);

    @Query("SELECT DISTINCT r.salaryMonth FROM SalaryRecord r ORDER BY r.salaryMonth DESC")
    List<String> findDistinctMonths();
}
