package com.juku.service;

import com.juku.dto.InvoiceRequest;
import com.juku.dto.InvoiceResponse;
import com.juku.entity.*;
import com.juku.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final StudentRepository studentRepository;
    private final StudentCourseRepository studentCourseRepository;

    public List<InvoiceResponse> search(String month, String status, Long studentId) {
        Invoice.Status statusEnum = null;
        if (status != null && !status.isBlank()) {
            try { statusEnum = Invoice.Status.valueOf(status); } catch (IllegalArgumentException ignored) {}
        }
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
        if (status != null) inv.setStatus(Invoice.Status.valueOf(status));
        invoiceRepository.save(inv);
    }

    /** 月次一括請求書生成: 在籍中の全生徒に対して未作成分のみ作成 */
    @Transactional
    public List<InvoiceResponse> bulkGenerate(String month) {
        YearMonth ym = YearMonth.parse(month);
        LocalDate dueDate = ym.atEndOfMonth();

        List<Student> activeStudents = studentRepository.findAll().stream()
                .filter(s -> s.getStatus() == Student.Status.ACTIVE)
                .toList();

        List<InvoiceResponse> created = new ArrayList<>();
        for (Student student : activeStudents) {
            // 既に作成済みならスキップ
            if (invoiceRepository.findByStudentIdAndBillingMonth(student.getId(), month).isPresent()) {
                continue;
            }
            // 受講中コースを取得
            List<StudentCourse> courses = studentCourseRepository.findByStudentId(student.getId())
                    .stream().filter(sc -> sc.getEndedAt() == null).toList();
            if (courses.isEmpty()) continue;

            Invoice inv = new Invoice();
            inv.setStudent(student);
            inv.setBillingMonth(month);
            inv.setDueDate(dueDate);

            List<InvoiceItem> items = new ArrayList<>();
            int total = 0;
            int order = 1;
            for (StudentCourse sc : courses) {
                InvoiceItem item = new InvoiceItem();
                item.setInvoice(inv);
                item.setDescription(sc.getCourse().getName() + " 受講料");
                item.setAmount(sc.getCourse().getMonthlyFee());
                item.setSortOrder(order++);
                items.add(item);
                total += sc.getCourse().getMonthlyFee();
            }
            inv.setItems(items);
            inv.setTotalAmount(total);
            created.add(new InvoiceResponse(invoiceRepository.save(inv)));
        }
        return created;
    }
}
