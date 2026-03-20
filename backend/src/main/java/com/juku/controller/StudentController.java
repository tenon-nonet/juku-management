package com.juku.controller;

import com.juku.dto.*;
import com.juku.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final StudentCourseService studentCourseService;
    private final AttendanceService attendanceService;
    private final ExamResultService examResultService;
    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<StudentResponse>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(studentService.search(name, grade, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.findById(id));
    }

    @PostMapping
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.ok(studentService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> update(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        return ResponseEntity.ok(studentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/courses")
    public ResponseEntity<List<StudentCourseResponse>> getCourses(@PathVariable Long id) {
        return ResponseEntity.ok(studentCourseService.findByStudent(id));
    }

    @PostMapping("/{id}/courses")
    public ResponseEntity<StudentCourseResponse> enrollCourse(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Long> body) {
        return ResponseEntity.ok(studentCourseService.enroll(id, body.get("courseId")));
    }

    @DeleteMapping("/{id}/courses/{studentCourseId}")
    public ResponseEntity<Void> unenrollCourse(@PathVariable Long id, @PathVariable Long studentCourseId) {
        studentCourseService.unenroll(studentCourseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/attendances")
    public ResponseEntity<List<AttendanceResponse>> getAttendances(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.findByStudent(id));
    }

    @GetMapping("/{id}/exam-results")
    public ResponseEntity<List<ExamResultResponse>> getExamResults(@PathVariable Long id) {
        return ResponseEntity.ok(examResultService.search(id, null));
    }

    @GetMapping("/{id}/invoices")
    public ResponseEntity<List<InvoiceResponse>> getInvoices(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.search(null, null, id));
    }
}
