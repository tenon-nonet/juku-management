package com.juku.repository;

import com.juku.entity.ConsultationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsultationRecordRepository extends JpaRepository<ConsultationRecord, Long> {
    List<ConsultationRecord> findByStudentIdOrderByConsultationDateDesc(Long studentId);
}
