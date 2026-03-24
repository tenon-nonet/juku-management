package com.juku.controller;

import com.juku.dto.AbsenceRequestDto;
import com.juku.service.AbsenceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/absence-requests")
@RequiredArgsConstructor
public class AbsenceRequestController {

    private final AbsenceRequestService absenceRequestService;

    @GetMapping("/pending")
    public List<AbsenceRequestDto> pending() {
        return absenceRequestService.findPending();
    }

    @GetMapping("/student/{studentId}")
    public List<AbsenceRequestDto> byStudent(@PathVariable Long studentId) {
        return absenceRequestService.findByStudent(studentId);
    }

    @PostMapping
    public AbsenceRequestDto create(@RequestBody AbsenceRequestDto req) {
        return absenceRequestService.create(req);
    }

    @PatchMapping("/{id}")
    public AbsenceRequestDto updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String status = (String) body.get("status");
        Long makeupLessonId = body.containsKey("makeupLessonId") && body.get("makeupLessonId") != null
                ? Long.valueOf(body.get("makeupLessonId").toString()) : null;
        return absenceRequestService.updateStatus(id, status, makeupLessonId);
    }
}
