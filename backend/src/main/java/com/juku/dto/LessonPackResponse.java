package com.juku.dto;

import com.juku.entity.LessonPack;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class LessonPackResponse {
    private final Long id;
    private final String name;
    private final String packType;
    private final int totalSessions;
    private final int price;
    private final Long subjectId;
    private final String subjectName;
    private final LocalDate validFrom;
    private final LocalDate validTo;
    private final String description;
    private final boolean isActive;

    public LessonPackResponse(LessonPack p) {
        this.id = p.getId();
        this.name = p.getName();
        this.packType = p.getPackType().name();
        this.totalSessions = p.getTotalSessions();
        this.price = p.getPrice();
        this.subjectId = p.getSubject() != null ? p.getSubject().getId() : null;
        this.subjectName = p.getSubject() != null ? p.getSubject().getName() : null;
        this.validFrom = p.getValidFrom();
        this.validTo = p.getValidTo();
        this.description = p.getDescription();
        this.isActive = p.isActive();
    }
}
