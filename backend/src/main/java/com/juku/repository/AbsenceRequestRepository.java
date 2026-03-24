package com.juku.repository;

import com.juku.entity.AbsenceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AbsenceRequestRepository extends JpaRepository<AbsenceRequest, Long> {
    List<AbsenceRequest> findByStudentIdOrderByAbsenceDateDesc(Long studentId);
    List<AbsenceRequest> findByStatusOrderByAbsenceDateDesc(AbsenceRequest.Status status);
    List<AbsenceRequest> findByLessonId(Long lessonId);
}
