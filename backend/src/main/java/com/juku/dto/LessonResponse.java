package com.juku.dto;

import com.juku.entity.Lesson;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class LessonResponse {
    private final Long id;
    private final Long courseId;
    private final String courseName;
    private final Long teacherId;
    private final String teacherName;
    private final String classroom;
    private final LocalDateTime scheduledAt;
    private final int durationMin;
    private final String status;
    private final String note;

    public LessonResponse(Lesson l) {
        this.id = l.getId();
        this.courseId = l.getCourse().getId();
        this.courseName = l.getCourse().getName();
        this.teacherId = l.getTeacher() != null ? l.getTeacher().getId() : null;
        this.teacherName = l.getTeacher() != null ? l.getTeacher().getFullName() : null;
        this.classroom = l.getClassroom();
        this.scheduledAt = l.getScheduledAt();
        this.durationMin = l.getDurationMin();
        this.status = l.getStatus().name();
        this.note = l.getNote();
    }
}
