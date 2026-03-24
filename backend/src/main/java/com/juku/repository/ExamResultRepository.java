package com.juku.repository;

import com.juku.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    List<ExamResult> findByStudentIdOrderByExamDateDesc(Long studentId);

    @Query("SELECT r FROM ExamResult r WHERE " +
           "(:studentId IS NULL OR r.student.id = :studentId) AND " +
           "(:subjectId IS NULL OR r.subject.id = :subjectId) " +
           "ORDER BY r.examDate DESC")
    List<ExamResult> search(
        @Param("studentId") Long studentId,
        @Param("subjectId") Long subjectId
    );

    @Query("SELECT r FROM ExamResult r WHERE r.student.id = :studentId ORDER BY r.examDate ASC")
    List<ExamResult> findByStudentIdOrderByExamDateAsc(@Param("studentId") Long studentId);

    @Query("SELECT r FROM ExamResult r WHERE r.student.schoolName = :schoolName AND r.examName = :examName ORDER BY r.score DESC")
    List<ExamResult> findBySchoolAndExam(@Param("schoolName") String schoolName, @Param("examName") String examName);

    @Query("SELECT DISTINCT r.examName FROM ExamResult r WHERE r.student.id = :studentId ORDER BY r.examName")
    List<String> findDistinctExamNamesByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT DISTINCT r.examName FROM ExamResult r ORDER BY r.examName")
    List<String> findAllDistinctExamNames();
}
