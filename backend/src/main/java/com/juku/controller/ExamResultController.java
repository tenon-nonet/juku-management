package com.juku.controller;

import com.juku.dto.ExamResultRequest;
import com.juku.dto.ExamResultResponse;
import com.juku.entity.ExamType;
import com.juku.repository.ExamTypeRepository;
import com.juku.service.ExamResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exam-results")
@RequiredArgsConstructor
public class ExamResultController {

    private final ExamResultService examResultService;
    private final ExamTypeRepository examTypeRepository;

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
}
