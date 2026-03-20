package com.juku.dto;

import com.juku.entity.Announcement;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AnnouncementResponse {
    private final Long id;
    private final String title;
    private final String content;
    private final String target;
    private final String targetValue;
    private final boolean isPublished;
    private final LocalDateTime publishedAt;
    private final LocalDateTime expiresAt;
    private final String createdBy;
    private final LocalDateTime createdAt;

    public AnnouncementResponse(Announcement a) {
        this.id = a.getId();
        this.title = a.getTitle();
        this.content = a.getContent();
        this.target = a.getTarget();
        this.targetValue = a.getTargetValue();
        this.isPublished = a.isPublished();
        this.publishedAt = a.getPublishedAt();
        this.expiresAt = a.getExpiresAt();
        this.createdBy = a.getCreatedBy() != null ? a.getCreatedBy().getFullName() : null;
        this.createdAt = a.getCreatedAt();
    }
}
