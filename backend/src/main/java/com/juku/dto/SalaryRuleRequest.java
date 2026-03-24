package com.juku.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class SalaryRuleRequest {
    private Long staffId;
    private String lessonType;
    private int amountPerLesson;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
