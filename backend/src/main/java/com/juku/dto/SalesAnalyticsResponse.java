package com.juku.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class SalesAnalyticsResponse {
    private List<MonthlyRevenue> monthlyRevenue;
    private List<CourseBreakdown> courseBreakdown;
    private List<EnrollmentTrend> enrollmentTrend;
    private List<StaffLessonCount> staffLessonCounts;
    private SalesSummary summary;

    @Getter @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private long billedAmount;
        private long collectedAmount;
        private long uncollectedAmount;
        private long invoiceCount;
    }

    @Getter @AllArgsConstructor
    public static class CourseBreakdown {
        private String courseName;
        private long studentCount;
        private long monthlyRevenue;
    }

    @Getter @AllArgsConstructor
    public static class EnrollmentTrend {
        private String month;
        private long activeCount;
        private long newCount;
        private long leftCount;
    }

    @Getter @AllArgsConstructor
    public static class StaffLessonCount {
        private Long staffId;
        private String staffName;
        private long lessonCount;
        private long doneCount;
    }

    @Getter @AllArgsConstructor
    public static class SalesSummary {
        private long totalStudents;
        private long activeStudents;
        private long currentMonthRevenue;
        private long unpaidAmount;
        private long overdueAmount;
    }
}
