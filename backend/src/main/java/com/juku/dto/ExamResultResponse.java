package com.juku.dto;

import com.juku.entity.ExamResult;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
public class ExamResultResponse {
    private final Long id;
    private final Long studentId;
    private final String studentName;
    private final Long subjectId;
    private final String subjectName;
    private final String subjectColor;
    private final Long examTypeId;
    private final String examTypeName;
    private final String examName;
    private final LocalDate examDate;
    private final BigDecimal score;
    private final BigDecimal maxScore;
    private final Integer rank;
    private final Integer totalStudents;
    private final String memo;
    private final Integer academicYear;
    private final Short semester;
    private final String gradeAtExam;

    public ExamResultResponse(ExamResult r) {
        this.id = r.getId();
        this.studentId = r.getStudent().getId();
        this.studentName = r.getStudent().getFullName();
        this.subjectId = r.getSubject().getId();
        this.subjectName = r.getSubject().getName();
        this.subjectColor = r.getSubject().getColor();
        this.examTypeId = r.getExamType() != null ? r.getExamType().getId() : null;
        this.examTypeName = r.getExamType() != null ? r.getExamType().getName() : null;
        this.examName = r.getExamName();
        this.examDate = r.getExamDate();
        this.score = r.getScore();
        this.maxScore = r.getMaxScore();
        this.rank = r.getRank();
        this.totalStudents = r.getTotalStudents();
        this.memo = r.getMemo();
        this.academicYear = r.getAcademicYear();
        this.semester = r.getSemester();
        this.gradeAtExam = r.getGradeAtExam();
    }
}
