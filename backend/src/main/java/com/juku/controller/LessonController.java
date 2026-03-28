package com.juku.controller;

import com.juku.dto.AttendanceResponse;
import com.juku.dto.AttendanceUpdateRequest;
import com.juku.dto.LessonRequest;
import com.juku.dto.LessonResponse;
import com.juku.service.AttendanceService;
import com.juku.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;
    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<List<LessonResponse>> findAll(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long studentId) {
        return ResponseEntity.ok(lessonService.findByFilters(from, to, courseId, teacherId, studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.findById(id));
    }

    @PostMapping
    public ResponseEntity<LessonResponse> create(@Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LessonResponse> update(@PathVariable Long id, @Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.update(id, request));
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<LessonResponse> reschedule(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        LocalDateTime scheduledAt = LocalDateTime.parse(body.get("scheduledAt"));
        return ResponseEntity.ok(lessonService.reschedule(id, scheduledAt));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<LessonResponse>> bulkCreate(
            @Valid @RequestBody LessonRequest request,
            @RequestParam(defaultValue = "1") int repeatWeeks) {
        return ResponseEntity.ok(lessonService.bulkCreate(request, repeatWeeks));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        lessonService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/attendances")
    public ResponseEntity<List<AttendanceResponse>> getAttendances(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.findByLesson(id));
    }

    @PutMapping("/{id}/attendances")
    public ResponseEntity<List<AttendanceResponse>> updateAttendances(
            @PathVariable Long id,
            @RequestBody AttendanceUpdateRequest request) {
        return ResponseEntity.ok(attendanceService.bulkUpdate(id, request));
    }
}
