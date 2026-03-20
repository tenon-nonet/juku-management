package com.juku.repository;

import com.juku.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByLessonId(Long lessonId);
    List<Attendance> findByStudentId(Long studentId);
    Optional<Attendance> findByLessonIdAndStudentId(Long lessonId, Long studentId);
}
