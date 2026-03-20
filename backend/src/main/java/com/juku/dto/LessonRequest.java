package com.juku.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class LessonRequest {
    @NotNull
    private Long courseId;
    private Long teacherId;
    private String classroom;
    @NotNull
    private LocalDateTime scheduledAt;
    private int durationMin = 60;
    private String status;
    private String note;
}
