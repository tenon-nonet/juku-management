package com.juku.controller;

import com.juku.dto.SalesAnalyticsResponse;
import com.juku.dto.InvoiceResponse;
import com.juku.service.SalesAnalyticsService;
import com.juku.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesAnalyticsService salesAnalyticsService;
    private final InvoiceService invoiceService;

    @GetMapping("/analytics")
    public SalesAnalyticsResponse analytics(@RequestParam(defaultValue = "12") int months) {
        return salesAnalyticsService.getAnalytics(months);
    }

    @PostMapping("/invoices/bulk-generate")
    public List<InvoiceResponse> bulkGenerate(@RequestBody Map<String, String> body) {
        return invoiceService.bulkGenerate(body.get("month"));
    }
}
