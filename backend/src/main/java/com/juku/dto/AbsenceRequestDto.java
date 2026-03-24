package com.juku.dto;

import com.juku.entity.AbsenceRequest;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class AbsenceRequestDto {
    // Request fields
    private Long studentId;
    private Long lessonId;
    private LocalDate absenceDate;
    private String reason;
    private boolean wantsMakeup;
    private String status;
    private Long makeupLessonId;

    // Response fields (populated from entity)
    private Long id;
    private String studentName;
    private String lessonInfo;

    public AbsenceRequestDto() {}

    public AbsenceRequestDto(AbsenceRequest r) {
        this.id = r.getId();
        this.studentId = r.getStudent().getId();
        this.studentName = r.getStudent().getFullName();
        this.lessonId = r.getLesson() != null ? r.getLesson().getId() : null;
        this.lessonInfo = r.getLesson() != null ? r.getLesson().getCourse().getName() : null;
        this.absenceDate = r.getAbsenceDate();
        this.reason = r.getReason();
        this.wantsMakeup = r.isWantsMakeup();
        this.status = r.getStatus().name();
        this.makeupLessonId = r.getMakeupLesson() != null ? r.getMakeupLesson().getId() : null;
    }
}
