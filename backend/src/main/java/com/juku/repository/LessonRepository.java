package com.juku.repository;

import com.juku.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    @Query("SELECT l FROM Lesson l WHERE l.scheduledAt BETWEEN :from AND :to ORDER BY l.scheduledAt ASC")
    List<Lesson> findByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT l FROM Lesson l WHERE l.scheduledAt BETWEEN :from AND :to AND (:courseId IS NULL OR l.course.id = :courseId) ORDER BY l.scheduledAt ASC")
    List<Lesson> findByDateRangeAndCourse(
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        @Param("courseId") Long courseId
    );

    long countByScheduledAtBetween(LocalDateTime from, LocalDateTime to);
}
