package com.juku.dto;

import com.juku.entity.StudentLessonPack;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class StudentLessonPackResponse {
    private final Long id;
    private final Long studentId;
    private final String studentName;
    private final Long packId;
    private final String packName;
    private final String packType;
    private final LocalDate purchasedAt;
    private final int totalSessions;
    private final int usedSessions;
    private final int remainingSessions;

    public StudentLessonPackResponse(StudentLessonPack sp) {
        this.id = sp.getId();
        this.studentId = sp.getStudent().getId();
        this.studentName = sp.getStudent().getFullName();
        this.packId = sp.getPack().getId();
        this.packName = sp.getPack().getName();
        this.packType = sp.getPack().getPackType().name();
        this.purchasedAt = sp.getPurchasedAt();
        this.totalSessions = sp.getTotalSessions();
        this.usedSessions = sp.getUsedSessions();
        this.remainingSessions = sp.getRemainingSession();
    }
}
