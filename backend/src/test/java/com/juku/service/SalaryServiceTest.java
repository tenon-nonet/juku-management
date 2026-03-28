package com.juku.service;

import com.juku.dto.SalaryRecordResponse;
import com.juku.entity.*;
import com.juku.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalaryServiceTest {

    @Mock
    private SalaryRuleRepository ruleRepository;

    @Mock
    private SalaryRecordRepository recordRepository;

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private LessonRepository lessonRepository;

    @InjectMocks
    private SalaryService salaryService;

    // -----------------------------------------------------------------------
    // calculate_computesCorrectAmount
    // -----------------------------------------------------------------------
    @Test
    void calculate_computesCorrectAmount() {
        // Given: TEACHER が3コマ実施、単価 5000 円のルールが有効
        Staff teacher = buildTeacher(1L, "山田 先生");
        when(staffRepository.findAll()).thenReturn(List.of(teacher));

        when(lessonRepository.countByTeacherIdAndStatusAndScheduledAtBetween(
                eq(1L), eq(Lesson.Status.DONE), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(3L);

        SalaryRule rule = new SalaryRule();
        rule.setAmountPerLesson(5000);
        rule.setEffectiveFrom(LocalDate.of(2026, 1, 1));
        rule.setEffectiveTo(null);
        when(ruleRepository.findByStaffIdOrderByEffectiveFromDesc(1L))
                .thenReturn(List.of(rule));

        SalaryRecord existingRecord = new SalaryRecord();
        existingRecord.setStaff(teacher);
        existingRecord.setSalaryMonth("2026-03");
        when(recordRepository.findByStaffIdAndSalaryMonth(1L, "2026-03"))
                .thenReturn(Optional.of(existingRecord));

        SalaryRecord savedRecord = buildSalaryRecord(1L, teacher, "2026-03", 3, 15000, 15000);
        when(recordRepository.save(any(SalaryRecord.class))).thenReturn(savedRecord);
        when(recordRepository.findBySalaryMonth("2026-03")).thenReturn(List.of(savedRecord));

        // When
        List<SalaryRecordResponse> result = salaryService.calculate("2026-03");

        // Then: 3コマ × 5000円 = 15000円
        assertEquals(1, result.size());
        assertEquals(15000, result.get(0).getBaseAmount());
        assertEquals(3, result.get(0).getLessonCount());
    }

    // -----------------------------------------------------------------------
    // calculate_zeroRateWhenNoRule
    // -----------------------------------------------------------------------
    @Test
    void calculate_zeroRateWhenNoRule() {
        // Given: TEACHER にルールが存在しない
        Staff teacher = buildTeacher(2L, "伊藤 先生");
        when(staffRepository.findAll()).thenReturn(List.of(teacher));

        when(lessonRepository.countByTeacherIdAndStatusAndScheduledAtBetween(
                eq(2L), eq(Lesson.Status.DONE), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(5L);

        when(ruleRepository.findByStaffIdOrderByEffectiveFromDesc(2L))
                .thenReturn(Collections.emptyList());

        when(recordRepository.findByStaffIdAndSalaryMonth(2L, "2026-03"))
                .thenReturn(Optional.empty());

        SalaryRecord savedRecord = buildSalaryRecord(2L, teacher, "2026-03", 5, 0, 0);
        when(recordRepository.save(any(SalaryRecord.class))).thenReturn(savedRecord);
        when(recordRepository.findBySalaryMonth("2026-03")).thenReturn(List.of(savedRecord));

        // When
        List<SalaryRecordResponse> result = salaryService.calculate("2026-03");

        // Then: ルールなしなので baseAmount = 0
        assertEquals(1, result.size());
        assertEquals(0, result.get(0).getBaseAmount());
    }

    // -----------------------------------------------------------------------
    // updateStatus_nullStatusKeepsExisting
    // -----------------------------------------------------------------------
    @Test
    void updateStatus_nullStatusKeepsExisting() {
        // Given: 既存レコードのステータスが CONFIRMED、status=null で呼び出し
        Staff teacher = buildTeacher(3L, "渡辺 先生");
        SalaryRecord rec = buildSalaryRecord(10L, teacher, "2026-02", 2, 10000, 10000);
        rec.setStatus(SalaryRecord.Status.CONFIRMED);

        when(recordRepository.findById(10L)).thenReturn(Optional.of(rec));
        when(recordRepository.save(any(SalaryRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        // When: status = null を渡す
        SalaryRecordResponse response = salaryService.updateStatus(10L, null, null, null);

        // Then: ステータスは CONFIRMED のまま変わらない
        assertEquals("CONFIRMED", response.getStatus());
        verify(recordRepository).save(rec);
    }

    // -----------------------------------------------------------------------
    // Helper methods
    // -----------------------------------------------------------------------

    private Staff buildTeacher(Long id, String fullName) {
        Staff s = new Staff();
        s.setId(id);
        s.setFullName(fullName);
        s.setUsername("teacher" + id);
        s.setPassword("dummy");
        s.setRole(Staff.Role.TEACHER);
        return s;
    }

    private SalaryRecord buildSalaryRecord(Long id, Staff staff, String month,
                                           int lessonCount, int baseAmount, int totalAmount) {
        SalaryRecord r = new SalaryRecord();
        r.setId(id);
        r.setStaff(staff);
        r.setSalaryMonth(month);
        r.setLessonCount(lessonCount);
        r.setBaseAmount(baseAmount);
        r.setTotalAmount(totalAmount);
        r.setStatus(SalaryRecord.Status.DRAFT);
        return r;
    }
}
