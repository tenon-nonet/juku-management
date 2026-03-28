package com.juku.service;

import com.juku.dto.SalesAnalyticsResponse;
import com.juku.dto.SalesAnalyticsResponse.*;
import com.juku.entity.Invoice;
import com.juku.entity.Student;
import com.juku.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesAnalyticsService {

    private final InvoiceRepository invoiceRepository;
    private final StudentRepository studentRepository;
    private final LessonRepository lessonRepository;
    private final StaffRepository staffRepository;
    private final CourseRepository courseRepository;
    private final StudentCourseRepository studentCourseRepository;

    public SalesAnalyticsResponse getAnalytics(int months) {
        List<MonthlyRevenue> monthlyRevenue = buildMonthlyRevenue(months);
        List<CourseBreakdown> courseBreakdown = buildCourseBreakdown();
        List<EnrollmentTrend> enrollmentTrend = buildEnrollmentTrend(months);
        List<StaffLessonCount> staffLessonCounts = buildStaffLessonCounts(months);
        SalesSummary summary = buildSummary();

        return new SalesAnalyticsResponse(monthlyRevenue, courseBreakdown, enrollmentTrend, staffLessonCounts, summary);
    }

    private List<MonthlyRevenue> buildMonthlyRevenue(int months) {
        List<MonthlyRevenue> result = new ArrayList<>();
        YearMonth current = YearMonth.now();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            String month = ym.toString();
            List<Invoice> invoices = invoiceRepository.search(month, null, null);
            long billed = invoices.stream().mapToLong(Invoice::getTotalAmount).sum();
            long collected = invoices.stream()
                    .filter(inv -> inv.getStatus() == Invoice.Status.PAID)
                    .mapToLong(Invoice::getTotalAmount).sum();
            long uncollected = billed - collected;
            result.add(new MonthlyRevenue(month, billed, collected, uncollected, invoices.size()));
        }
        return result;
    }

    private List<CourseBreakdown> buildCourseBreakdown() {
        return courseRepository.findAll().stream().map(course -> {
            long studentCount = studentCourseRepository.findByCourseId(course.getId()).stream()
                    .filter(sc -> sc.getEndedAt() == null).count();
            long revenue = studentCount * course.getMonthlyFee();
            return new CourseBreakdown(course.getName(), studentCount, revenue);
        }).filter(cb -> cb.getStudentCount() > 0).toList();
    }

    private List<EnrollmentTrend> buildEnrollmentTrend(int months) {
        List<EnrollmentTrend> result = new ArrayList<>();
        YearMonth current = YearMonth.now();
        List<Student> allStudents = studentRepository.findAll();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            String month = ym.toString();
            long activeCount = allStudents.stream().filter(s -> {
                String enrolled = s.getEnrolledAt() != null ? s.getEnrolledAt().toString().substring(0, 7) : "";
                String left = s.getLeftAt() != null ? s.getLeftAt().toString().substring(0, 7) : "9999-99";
                return enrolled.compareTo(month) <= 0 && left.compareTo(month) >= 0;
            }).count();
            long newCount = allStudents.stream().filter(s ->
                s.getEnrolledAt() != null && s.getEnrolledAt().toString().substring(0, 7).equals(month)
            ).count();
            long leftCount = allStudents.stream().filter(s ->
                s.getLeftAt() != null && s.getLeftAt().toString().substring(0, 7).equals(month)
            ).count();
            result.add(new EnrollmentTrend(month, activeCount, newCount, leftCount));
        }
        return result;
    }

    private List<StaffLessonCount> buildStaffLessonCounts(int months) {
        YearMonth from = YearMonth.now().minusMonths(months - 1);
        LocalDateTime fromDt = from.atDay(1).atStartOfDay();
        LocalDateTime toDt = YearMonth.now().atEndOfMonth().atTime(23, 59, 59);
        return staffRepository.findAll().stream().map(staff -> {
            List<?> lessons = lessonRepository.findByTeacherIdAndScheduledAtBetweenOrderByScheduledAtAsc(
                    staff.getId(), fromDt, toDt);
            long done = lessons.stream().filter(l -> {
                var lesson = (com.juku.entity.Lesson) l;
                return lesson.getStatus() == com.juku.entity.Lesson.Status.DONE;
            }).count();
            return new StaffLessonCount(staff.getId(), staff.getFullName(), lessons.size(), done);
        }).filter(s -> s.getLessonCount() > 0).toList();
    }

    private SalesSummary buildSummary() {
        long total = studentRepository.count();
        long active = studentRepository.countByStatus(Student.Status.ACTIVE);
        String currentMonth = YearMonth.now().toString();
        List<Invoice> current = invoiceRepository.search(currentMonth, null, null);
        long currentRevenue = current.stream()
                .filter(i -> i.getStatus() == Invoice.Status.PAID)
                .mapToLong(Invoice::getTotalAmount).sum();
        long unpaid = invoiceRepository.findByStatusOrderByDueDateAsc(Invoice.Status.UNPAID)
                .stream().mapToLong(Invoice::getTotalAmount).sum();
        long overdue = invoiceRepository.findByStatusOrderByDueDateAsc(Invoice.Status.OVERDUE)
                .stream().mapToLong(Invoice::getTotalAmount).sum();
        return new SalesSummary(total, active, currentRevenue, unpaid, overdue);
    }
}
