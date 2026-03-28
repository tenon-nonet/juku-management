package com.juku.service;

import com.juku.dto.InvoiceResponse;
import com.juku.entity.*;
import com.juku.repository.InvoiceRepository;
import com.juku.repository.StudentCourseRepository;
import com.juku.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private StudentCourseRepository studentCourseRepository;

    @InjectMocks
    private InvoiceService invoiceService;

    // -----------------------------------------------------------------------
    // bulkGenerate_skipsExistingInvoice
    // -----------------------------------------------------------------------
    @Test
    void bulkGenerate_skipsExistingInvoice() {
        // Given: ACTIVE な生徒が1人いて、同月の請求書がすでに存在する
        Student student = buildActiveStudent(1L, "田中 太郎");
        when(studentRepository.findAll()).thenReturn(List.of(student));
        when(invoiceRepository.findByStudentIdAndBillingMonth(1L, "2026-03"))
                .thenReturn(Optional.of(new Invoice()));

        // When
        List<InvoiceResponse> result = invoiceService.bulkGenerate("2026-03");

        // Then: 請求書は生成されない
        assertTrue(result.isEmpty());
        verify(invoiceRepository, never()).save(any());
    }

    // -----------------------------------------------------------------------
    // bulkGenerate_createsForActiveStudentsWithCourses
    // -----------------------------------------------------------------------
    @Test
    void bulkGenerate_createsForActiveStudentsWithCourses() {
        // Given: ACTIVE な生徒が1人、コースが1件（endedAt = null）、既存請求書なし
        Student student = buildActiveStudent(2L, "鈴木 花子");

        Course course = new Course();
        course.setName("数学コース");
        course.setMonthlyFee(15000);

        StudentCourse sc = new StudentCourse();
        sc.setStudent(student);
        sc.setCourse(course);
        sc.setEndedAt(null);

        when(studentRepository.findAll()).thenReturn(List.of(student));
        when(invoiceRepository.findByStudentIdAndBillingMonth(2L, "2026-03"))
                .thenReturn(Optional.empty());
        when(studentCourseRepository.findByStudentId(2L)).thenReturn(List.of(sc));

        Invoice savedInvoice = buildSavedInvoice(student, "2026-03", 15000);
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(savedInvoice);

        // When
        List<InvoiceResponse> result = invoiceService.bulkGenerate("2026-03");

        // Then: 1件の請求書が生成される
        assertEquals(1, result.size());
        verify(invoiceRepository, times(1)).save(any(Invoice.class));
    }

    // -----------------------------------------------------------------------
    // bulkGenerate_skipsStudentsWithNoCourses
    // -----------------------------------------------------------------------
    @Test
    void bulkGenerate_skipsStudentsWithNoCourses() {
        // Given: ACTIVE な生徒だがコースが0件
        Student student = buildActiveStudent(3L, "佐藤 次郎");

        when(studentRepository.findAll()).thenReturn(List.of(student));
        when(invoiceRepository.findByStudentIdAndBillingMonth(3L, "2026-03"))
                .thenReturn(Optional.empty());
        when(studentCourseRepository.findByStudentId(3L))
                .thenReturn(Collections.emptyList());

        // When
        List<InvoiceResponse> result = invoiceService.bulkGenerate("2026-03");

        // Then: 請求書は生成されない
        assertTrue(result.isEmpty());
        verify(invoiceRepository, never()).save(any());
    }

    // -----------------------------------------------------------------------
    // updateStatus_throwsOnInvalidId
    // -----------------------------------------------------------------------
    @Test
    void updateStatus_throwsOnInvalidId() {
        // Given: 存在しないID
        when(invoiceRepository.findById(999L)).thenReturn(Optional.empty());

        // When / Then: NOT_FOUND 例外がスローされる
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> invoiceService.updateStatus(999L, "PAID")
        );
        assertEquals(404, ex.getStatusCode().value());
    }

    // -----------------------------------------------------------------------
    // Helper methods
    // -----------------------------------------------------------------------

    private Student buildActiveStudent(Long id, String fullName) {
        Student s = new Student();
        s.setId(id);
        s.setFullName(fullName);
        s.setStatus(Student.Status.ACTIVE);
        s.setGrade("中1");
        return s;
    }

    private Invoice buildSavedInvoice(Student student, String month, int total) {
        Invoice inv = new Invoice();
        inv.setId(100L);
        inv.setStudent(student);
        inv.setBillingMonth(month);
        inv.setDueDate(LocalDate.of(2026, 3, 31));
        inv.setTotalAmount(total);
        inv.setStatus(Invoice.Status.UNPAID);
        return inv;
    }
}
