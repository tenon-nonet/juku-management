package com.juku.dto;

import com.juku.entity.Attendance;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AttendanceResponse {
    private final Long id;
    private final Long lessonId;
    private final Long studentId;
    private final String studentName;
    private final String status;
    private final String note;
    private final LocalDateTime lessonScheduledAt;
    private final String lessonCourseName;

    public AttendanceResponse(Attendance a) {
        this.id = a.getId();
        this.lessonId = a.getLesson().getId();
        this.studentId = a.getStudent().getId();
        this.studentName = a.getStudent().getFullName();
        this.status = a.getStatus().name();
        this.note = a.getNote();
        this.lessonScheduledAt = a.getLesson().getScheduledAt();
        this.lessonCourseName = a.getLesson().getCourse() != null
            ? a.getLesson().getCourse().getName() : null;
    }
}
