package com.juku.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AnnouncementRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private String target = "ALL";
    private String targetValue;
    private boolean isPublished;
    private LocalDateTime expiresAt;
}
