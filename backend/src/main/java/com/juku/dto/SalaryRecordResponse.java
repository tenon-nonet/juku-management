package com.juku.dto;

import com.juku.entity.SalaryRecord;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class SalaryRecordResponse {
    private final Long id;
    private final Long staffId;
    private final String staffName;
    private final String salaryMonth;
    private final int lessonCount;
    private final int baseAmount;
    private final int adjustment;
    private final int totalAmount;
    private final String note;
    private final String status;
    private final LocalDateTime updatedAt;

    public SalaryRecordResponse(SalaryRecord r) {
        this.id = r.getId();
        this.staffId = r.getStaff().getId();
        this.staffName = r.getStaff().getFullName();
        this.salaryMonth = r.getSalaryMonth();
        this.lessonCount = r.getLessonCount();
        this.baseAmount = r.getBaseAmount();
        this.adjustment = r.getAdjustment();
        this.totalAmount = r.getTotalAmount();
        this.note = r.getNote();
        this.status = r.getStatus().name();
        this.updatedAt = r.getUpdatedAt();
    }
}
