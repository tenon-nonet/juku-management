package com.juku.controller;

import com.juku.dto.InvoiceRequest;
import com.juku.dto.InvoiceResponse;
import com.juku.dto.PaymentRequest;
import com.juku.dto.PaymentResponse;
import com.juku.service.InvoiceService;
import com.juku.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> search(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long studentId) {
        return ResponseEntity.ok(invoiceService.search(month, status, studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.findById(id));
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> update(@PathVariable Long id, @Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        invoiceService.updateStatus(id, body.get("status"));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<List<PaymentResponse>> getPayments(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.findByInvoice(id));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<PaymentResponse> addPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentService.create(id, request, userDetails.getUsername()));
    }
}
