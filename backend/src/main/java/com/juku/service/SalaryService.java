package com.juku.service;

import com.juku.dto.SalaryRuleRequest;
import com.juku.dto.SalaryRecordResponse;
import com.juku.entity.*;
import com.juku.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaryService {

    private final SalaryRuleRepository ruleRepository;
    private final SalaryRecordRepository recordRepository;
    private final StaffRepository staffRepository;
    private final LessonRepository lessonRepository;

    public List<SalaryRecordResponse> getByMonth(String month) {
        return recordRepository.findBySalaryMonth(month)
                .stream().map(SalaryRecordResponse::new).toList();
    }

    public List<SalaryRecordResponse> getByStaff(Long staffId) {
        return recordRepository.findByStaffIdOrderBySalaryMonthDesc(staffId)
                .stream().map(SalaryRecordResponse::new).toList();
    }

    public List<String> getMonths() {
        return recordRepository.findDistinctMonths();
    }

    // 給与ルール
    public void saveRule(SalaryRuleRequest req) {
        var staff = staffRepository.findById(req.getStaffId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        SalaryRule rule = new SalaryRule();
        rule.setStaff(staff);
        rule.setLessonType(req.getLessonType() != null ? req.getLessonType() : "REGULAR");
        rule.setAmountPerLesson(req.getAmountPerLesson());
        rule.setEffectiveFrom(req.getEffectiveFrom() != null ? req.getEffectiveFrom() : LocalDate.now());
        rule.setEffectiveTo(req.getEffectiveTo());
        ruleRepository.save(rule);
    }

    public List<SalaryRule> getRules(Long staffId) {
        return ruleRepository.findByStaffIdOrderByEffectiveFromDesc(staffId);
    }

    // 月次給与計算（一括）
    @Transactional
    public List<SalaryRecordResponse> calculate(String month) {
        YearMonth ym = YearMonth.parse(month);
        LocalDateTime from = ym.atDay(1).atStartOfDay();
        LocalDateTime to   = ym.atEndOfMonth().atTime(23, 59, 59);

        List<Staff> teachers = staffRepository.findAll().stream()
                .filter(s -> s.getRole() == Staff.Role.TEACHER || s.getRole() == Staff.Role.STAFF)
                .toList();

        for (Staff staff : teachers) {
            long count = lessonRepository.countByTeacherIdAndStatusAndScheduledAtBetween(
                    staff.getId(), Lesson.Status.DONE, from, to);

            // 有効なルールを取得
            List<SalaryRule> rules = ruleRepository.findByStaffIdOrderByEffectiveFromDesc(staff.getId());
            int rate = rules.stream()
                    .filter(r -> !r.getEffectiveFrom().isAfter(ym.atEndOfMonth())
                              && (r.getEffectiveTo() == null || !r.getEffectiveTo().isBefore(ym.atDay(1))))
                    .mapToInt(SalaryRule::getAmountPerLesson)
                    .findFirst().orElse(0);

            int base = (int)(count * rate);

            SalaryRecord rec = recordRepository.findByStaffIdAndSalaryMonth(staff.getId(), month)
                    .orElse(new SalaryRecord());
            rec.setStaff(staff);
            rec.setSalaryMonth(month);
            rec.setLessonCount((int) count);
            rec.setBaseAmount(base);
            rec.setTotalAmount(base + rec.getAdjustment());
            if (rec.getStatus() == null) rec.setStatus(SalaryRecord.Status.DRAFT);
            recordRepository.save(rec);
        }

        return getByMonth(month);
    }

    @Transactional
    public SalaryRecordResponse updateStatus(Long id, String status, Integer adjustment, String note) {
        SalaryRecord rec = recordRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (status != null) rec.setStatus(SalaryRecord.Status.valueOf(status));
        if (adjustment != null) {
            rec.setAdjustment(adjustment);
            rec.setTotalAmount(rec.getBaseAmount() + adjustment);
        }
        if (note != null) rec.setNote(note);
        return new SalaryRecordResponse(recordRepository.save(rec));
    }
}
