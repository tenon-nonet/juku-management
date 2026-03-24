package com.juku.dto;

import com.juku.entity.Staff;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class StaffResponse {
    private final Long id;
    private final String username;
    private final String fullName;
    private final String role;
    private final boolean isActive;
    private final String memo;
    private final List<Long> subjectIds;
    private final List<String> subjectNames;
    private final LocalDateTime createdAt;

    public StaffResponse(Staff staff) {
        this.id = staff.getId();
        this.username = staff.getUsername();
        this.fullName = staff.getFullName();
        this.role = staff.getRole().name();
        this.isActive = staff.isActive();
        this.memo = staff.getMemo();
        this.subjectIds = staff.getSubjects().stream().map(s -> s.getId()).toList();
        this.subjectNames = staff.getSubjects().stream().map(s -> s.getName()).toList();
        this.createdAt = staff.getCreatedAt();
    }
}
