package com.juku.dto;

import com.juku.entity.StudentCourse;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class StudentCourseResponse {
    private final Long id;
    private final Long studentId;
    private final Long courseId;
    private final String courseName;
    private final String subjectName;
    private final int monthlyFee;
    private final LocalDate startedAt;
    private final LocalDate endedAt;

    public StudentCourseResponse(StudentCourse sc) {
        this.id = sc.getId();
        this.studentId = sc.getStudent().getId();
        this.courseId = sc.getCourse().getId();
        this.courseName = sc.getCourse().getName();
        this.subjectName = sc.getCourse().getSubject() != null ? sc.getCourse().getSubject().getName() : null;
        this.monthlyFee = sc.getCourse().getMonthlyFee();
        this.startedAt = sc.getStartedAt();
        this.endedAt = sc.getEndedAt();
    }
}
