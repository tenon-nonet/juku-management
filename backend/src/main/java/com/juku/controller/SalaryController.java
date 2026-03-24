package com.juku.controller;

import com.juku.dto.SalaryRuleRequest;
import com.juku.dto.SalaryRecordResponse;
import com.juku.entity.SalaryRule;
import com.juku.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salary")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService salaryService;

    @GetMapping("/months")
    public List<String> months() {
        return salaryService.getMonths();
    }

    @GetMapping
    public List<SalaryRecordResponse> byMonth(@RequestParam String month) {
        return salaryService.getByMonth(month);
    }

    @GetMapping("/staff/{staffId}")
    public List<SalaryRecordResponse> byStaff(@PathVariable Long staffId) {
        return salaryService.getByStaff(staffId);
    }

    @PostMapping("/calculate")
    public List<SalaryRecordResponse> calculate(@RequestBody Map<String, String> body) {
        return salaryService.calculate(body.get("month"));
    }

    @PatchMapping("/{id}")
    public SalaryRecordResponse updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String status = (String) body.get("status");
        Integer adjustment = body.containsKey("adjustment") ? Integer.valueOf(body.get("adjustment").toString()) : null;
        String note = (String) body.get("note");
        return salaryService.updateStatus(id, status, adjustment, note);
    }

    @GetMapping("/rules/{staffId}")
    public List<SalaryRule> rules(@PathVariable Long staffId) {
        return salaryService.getRules(staffId);
    }

    @PostMapping("/rules")
    public void saveRule(@RequestBody SalaryRuleRequest req) {
        salaryService.saveRule(req);
    }
}
