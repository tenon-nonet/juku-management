package com.juku.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long activeStudents;
    private long todayLessons;
    private long unpaidInvoices;
}
