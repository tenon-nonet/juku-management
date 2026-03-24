package com.juku.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class LessonPackRequest {
    private String name;
    private String packType;
    private int totalSessions;
    private int price;
    private Long subjectId;
    private LocalDate validFrom;
    private LocalDate validTo;
    private String description;
    private boolean isActive = true;
}
