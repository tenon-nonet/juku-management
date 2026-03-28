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

    @Query("SELECT l FROM Lesson l WHERE l.scheduledAt BETWEEN :from AND :to ORDER BY l.scheduledAt ASC")
    List<Lesson> findByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    long countByTeacherIdAndStatusAndScheduledAtBetween(
        Long teacherId, Lesson.Status status, LocalDateTime from, LocalDateTime to
    );

    /** 指定時間帯に重複する授業数（キャンセル除く） */
    @Query(value = "SELECT COUNT(*) FROM lessons WHERE status != 'CANCELLED' " +
                   "AND scheduled_at < :end " +
                   "AND (scheduled_at + duration_min * INTERVAL '1 minute') > :start",
           nativeQuery = true)
    long countConcurrentLessons(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /** 指定IDを除いた重複授業数（更新時用） */
    @Query(value = "SELECT COUNT(*) FROM lessons WHERE id != :excludeId AND status != 'CANCELLED' " +
                   "AND scheduled_at < :end " +
                   "AND (scheduled_at + duration_min * INTERVAL '1 minute') > :start",
           nativeQuery = true)
    long countConcurrentLessonsExcluding(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end,
                                         @Param("excludeId") Long excludeId);

    @Query("SELECT l FROM Lesson l WHERE l.teacher.id = :teacherId " +
           "AND l.status = 'DONE' AND l.scheduledAt BETWEEN :from AND :to")
    List<Lesson> findDoneByTeacherAndPeriod(
        @Param("teacherId") Long teacherId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );
}
