package com.juku.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class ConsultationRequest {
    private Long studentId;
    private LocalDate consultationDate;
    private String attendees;
    private String content;
    private String actionItems;
    private LocalDate nextDate;
    private Long staffId;
}
