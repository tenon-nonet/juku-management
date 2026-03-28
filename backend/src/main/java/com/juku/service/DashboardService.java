package com.juku.service;

import com.juku.dto.DashboardSummaryResponse;
import com.juku.dto.InvoiceResponse;
import com.juku.dto.LessonResponse;
import com.juku.entity.Invoice;
import com.juku.entity.Student;
import com.juku.repository.InvoiceRepository;
import com.juku.repository.LessonRepository;
import com.juku.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final StudentRepository studentRepository;
    private final LessonRepository lessonRepository;
    private final InvoiceRepository invoiceRepository;

    public DashboardSummaryResponse getSummary() {
        long activeStudents = studentRepository.countByStatus(Student.Status.ACTIVE);
        LocalDate today = LocalDate.now();
        long todayLessons = lessonRepository.countByScheduledAtBetween(
            today.atStartOfDay(),
            today.atTime(23, 59, 59)
        );
        long unpaidInvoices = invoiceRepository.countByStatus(Invoice.Status.UNPAID);
        return new DashboardSummaryResponse(activeStudents, todayLessons, unpaidInvoices);
    }

    public List<LessonResponse> getTodayLessons() {
        LocalDate today = LocalDate.now();
        return lessonRepository.findByDateRange(today.atStartOfDay(), today.atTime(23, 59, 59))
            .stream().map(LessonResponse::new).toList();
    }

    public List<InvoiceResponse> getUnpaidInvoices() {
        return invoiceRepository.findByStatusOrderByDueDateAsc(Invoice.Status.UNPAID)
            .stream().limit(10).map(InvoiceResponse::new).toList();
    }
}
