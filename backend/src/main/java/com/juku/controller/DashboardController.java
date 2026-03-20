package com.juku.controller;

import com.juku.dto.DashboardSummaryResponse;
import com.juku.dto.InvoiceResponse;
import com.juku.dto.LessonResponse;
import com.juku.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/today-lessons")
    public ResponseEntity<List<LessonResponse>> getTodayLessons() {
        return ResponseEntity.ok(dashboardService.getTodayLessons());
    }

    @GetMapping("/unpaid-invoices")
    public ResponseEntity<List<InvoiceResponse>> getUnpaidInvoices() {
        return ResponseEntity.ok(dashboardService.getUnpaidInvoices());
    }
}
