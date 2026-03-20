package com.juku.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AttendanceUpdateRequest {
    private List<AttendanceEntry> attendances;

    @Getter
    @Setter
    public static class AttendanceEntry {
        private Long studentId;
        private String status;
        private String note;
    }
}
