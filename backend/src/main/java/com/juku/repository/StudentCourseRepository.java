package com.juku.repository;

import com.juku.entity.StudentCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentCourseRepository extends JpaRepository<StudentCourse, Long> {
    List<StudentCourse> findByStudentId(Long studentId);
    List<StudentCourse> findByCourseId(Long courseId);
    boolean existsByStudentIdAndCourseIdAndEndedAtIsNull(Long studentId, Long courseId);
}
