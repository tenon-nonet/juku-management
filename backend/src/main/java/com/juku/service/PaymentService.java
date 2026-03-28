package com.juku.service;

import com.juku.dto.PaymentRequest;
import com.juku.dto.PaymentResponse;
import com.juku.entity.Invoice;
import com.juku.entity.Payment;
import com.juku.repository.InvoiceRepository;
import com.juku.repository.PaymentRepository;
import com.juku.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final StaffRepository staffRepository;

    public List<PaymentResponse> findByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceIdOrderByPaidAtDesc(invoiceId)
            .stream().map(PaymentResponse::new).toList();
    }

    @Transactional
    public PaymentResponse create(Long invoiceId, PaymentRequest req, String staffUsername) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        Payment p = new Payment();
        p.setInvoice(invoice);
        p.setPaidAmount(req.getPaidAmount());
        p.setPaidAt(req.getPaidAt());
        p.setMethod(req.getMethod());
        p.setNote(req.getNote());

        staffRepository.findByUsername(staffUsername).ifPresent(p::setRecordedBy);

        PaymentResponse response = new PaymentResponse(paymentRepository.save(p));

        // 全額入金チェック
        int totalPaid = paymentRepository.sumPaidAmountByInvoiceId(invoiceId);
        if (totalPaid >= invoice.getTotalAmount()) {
            invoice.setStatus(Invoice.Status.PAID);
            invoiceRepository.save(invoice);
        }

        return response;
    }

    public void delete(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        paymentRepository.deleteById(id);
    }
}
