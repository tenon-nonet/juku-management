package com.juku.service;

import com.juku.dto.InvoiceRequest;
import com.juku.dto.InvoiceResponse;
import com.juku.entity.Invoice;
import com.juku.entity.InvoiceItem;
import com.juku.repository.InvoiceRepository;
import com.juku.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final StudentRepository studentRepository;

    public List<InvoiceResponse> search(String month, String status, Long studentId) {
        Invoice.Status statusEnum = status != null ? Invoice.Status.valueOf(status) : null;
        return invoiceRepository.search(month, statusEnum, studentId)
            .stream().map(InvoiceResponse::new).toList();
    }

    public InvoiceResponse findById(Long id) {
        return invoiceRepository.findById(id)
            .map(InvoiceResponse::new)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public InvoiceResponse create(InvoiceRequest req) {
        var student = studentRepository.findById(req.getStudentId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student not found"));

        Invoice inv = new Invoice();
        inv.setStudent(student);
        inv.setBillingMonth(req.getBillingMonth());
        inv.setDueDate(req.getDueDate());
        inv.setNote(req.getNote());

        if (req.getItems() != null) {
            List<InvoiceItem> items = new ArrayList<>();
            int total = 0;
            for (var itemReq : req.getItems()) {
                InvoiceItem item = new InvoiceItem();
                item.setInvoice(inv);
                item.setDescription(itemReq.getDescription());
                item.setAmount(itemReq.getAmount());
                item.setSortOrder(itemReq.getSortOrder());
                items.add(item);
                total += itemReq.getAmount();
            }
            inv.setItems(items);
            inv.setTotalAmount(total);
        }

        return new InvoiceResponse(invoiceRepository.save(inv));
    }

    @Transactional
    public InvoiceResponse update(Long id, InvoiceRequest req) {
        Invoice inv = invoiceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        inv.setDueDate(req.getDueDate());
        inv.setNote(req.getNote());

        if (req.getItems() != null) {
            inv.getItems().clear();
            int total = 0;
            for (var itemReq : req.getItems()) {
                InvoiceItem item = new InvoiceItem();
                item.setInvoice(inv);
                item.setDescription(itemReq.getDescription());
                item.setAmount(itemReq.getAmount());
                item.setSortOrder(itemReq.getSortOrder());
                inv.getItems().add(item);
                total += itemReq.getAmount();
            }
            inv.setTotalAmount(total);
        }

        return new InvoiceResponse(invoiceRepository.save(inv));
    }

    public void updateStatus(Long id, String status) {
        Invoice inv = invoiceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        inv.setStatus(Invoice.Status.valueOf(status));
        invoiceRepository.save(inv);
    }
}
