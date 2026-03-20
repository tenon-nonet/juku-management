package com.juku.dto;

import com.juku.entity.Payment;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class PaymentResponse {
    private final Long id;
    private final Long invoiceId;
    private final int paidAmount;
    private final LocalDate paidAt;
    private final String method;
    private final String note;
    private final String recordedBy;
    private final LocalDateTime createdAt;

    public PaymentResponse(Payment p) {
        this.id = p.getId();
        this.invoiceId = p.getInvoice().getId();
        this.paidAmount = p.getPaidAmount();
        this.paidAt = p.getPaidAt();
        this.method = p.getMethod();
        this.note = p.getNote();
        this.recordedBy = p.getRecordedBy() != null ? p.getRecordedBy().getFullName() : null;
        this.createdAt = p.getCreatedAt();
    }
}
