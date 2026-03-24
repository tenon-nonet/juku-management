package com.juku.dto;

import com.juku.entity.ConsultationRecord;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class ConsultationResponse {
    private final Long id;
    private final Long studentId;
    private final String studentName;
    private final LocalDate consultationDate;
    private final String attendees;
    private final String content;
    private final String actionItems;
    private final LocalDate nextDate;
    private final Long staffId;
    private final String staffName;

    public ConsultationResponse(ConsultationRecord r) {
        this.id = r.getId();
        this.studentId = r.getStudent().getId();
        this.studentName = r.getStudent().getFullName();
        this.consultationDate = r.getConsultationDate();
        this.attendees = r.getAttendees();
        this.content = r.getContent();
        this.actionItems = r.getActionItems();
        this.nextDate = r.getNextDate();
        this.staffId = r.getStaff() != null ? r.getStaff().getId() : null;
        this.staffName = r.getStaff() != null ? r.getStaff().getFullName() : null;
    }
}
