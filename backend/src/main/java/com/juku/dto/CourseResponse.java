package com.juku.dto;

import com.juku.entity.Course;
import lombok.Getter;

@Getter
public class CourseResponse {
    private final Long id;
    private final String name;
    private final Long subjectId;
    private final String subjectName;
    private final String subjectColor;
    private final String gradeTarget;
    private final int monthlyFee;
    private final String description;
    private final boolean isActive;

    public CourseResponse(Course c) {
        this.id = c.getId();
        this.name = c.getName();
        this.subjectId = c.getSubject() != null ? c.getSubject().getId() : null;
        this.subjectName = c.getSubject() != null ? c.getSubject().getName() : null;
        this.subjectColor = c.getSubject() != null ? c.getSubject().getColor() : null;
        this.gradeTarget = c.getGradeTarget();
        this.monthlyFee = c.getMonthlyFee();
        this.description = c.getDescription();
        this.isActive = c.isActive();
    }
}
