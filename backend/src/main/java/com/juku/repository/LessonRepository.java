package com.juku.repository;

import com.juku.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    @Query("SELECT l FROM Lesson l WHERE l.scheduledAt BETWEEN :from AND :to " +
           "AND (:courseId IS NULL OR l.course.id = :courseId) " +
           "AND (:teacherId IS NULL OR l.teacher.id = :teacherId) " +
           "AND (:studentId IS NULL OR l.student.id = :studentId) " +
           "ORDER BY l.scheduledAt ASC")
    List<Lesson> findByFilters(
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        @Param("courseId") Long courseId,
        @Param("teacherId") Long teacherId,
        @Param("studentId") Long studentId
    );

    List<Lesson> findByTeacherIdAndScheduledAtBetweenOrderByScheduledAtAsc(
        Long teacherId, LocalDateTime from, LocalDateTime to
    );

    List<Lesson> findByStudentIdOrderByScheduledAtDesc(Long studentId);

    long countByScheduledAtBetween(LocalDateTime from, LocalDateTime to);
}
