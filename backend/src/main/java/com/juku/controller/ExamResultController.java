package com.juku.controller;

import com.juku.dto.ExamResultRequest;
import com.juku.dto.ExamResultResponse;
import com.juku.entity.ExamType;
import com.juku.repository.ExamResultRepository;
import com.juku.repository.ExamTypeRepository;
import com.juku.service.ExamResultService;
import com.juku.service.GradeImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exam-results")
@RequiredArgsConstructor
public class ExamResultController {

    private final ExamResultService examResultService;
    private final ExamTypeRepository examTypeRepository;
    private final ExamResultRepository examResultRepository;
    private final GradeImportService gradeImportService;

    @GetMapping
    public ResponseEntity<List<ExamResultResponse>> search(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long subjectId) {
        return ResponseEntity.ok(examResultService.search(studentId, subjectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamResultResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(examResultService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ExamResultResponse> create(@Valid @RequestBody ExamResultRequest request) {
        return ResponseEntity.ok(examResultService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamResultResponse> update(@PathVariable Long id, @Valid @RequestBody ExamResultRequest request) {
        return ResponseEntity.ok(examResultService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        examResultService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exam-types")
    public ResponseEntity<List<ExamType>> getExamTypes() {
        return ResponseEntity.ok(examTypeRepository.findAllByOrderBySortOrderAsc());
    }

    @PostMapping("/exam-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamType> createExamType(@RequestBody ExamType examType) {
        return ResponseEntity.ok(examTypeRepository.save(examType));
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importCsv(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(gradeImportService.importCsv(file));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long subjectId) throws IOException {
        byte[] csv = gradeImportService.exportCsv(studentId, subjectId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "exam-results.csv");
        return ResponseEntity.ok().headers(headers).body(csv);
    }

    @GetMapping("/analysis/trend/{studentId}")
    public ResponseEntity<List<Map<String, Object>>> getStudentTrend(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long subjectId) {
        return ResponseEntity.ok(gradeImportService.getStudentTrend(studentId, subjectId));
    }

    @GetMapping("/analysis/distribution")
    public ResponseEntity<Map<String, Object>> getSchoolDistribution(
            @RequestParam String schoolName,
            @RequestParam String examName) {
        return ResponseEntity.ok(gradeImportService.getSchoolDistribution(schoolName, examName));
    }

    @GetMapping("/exam-names")
    public ResponseEntity<List<String>> getExamNames(@RequestParam(required = false) Long studentId) {
        if (studentId != null) {
            return ResponseEntity.ok(examResultRepository.findDistinctExamNamesByStudentId(studentId));
        }
        return ResponseEntity.ok(examResultRepository.findAllDistinctExamNames());
    }
}
