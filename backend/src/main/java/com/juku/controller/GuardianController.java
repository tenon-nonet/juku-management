package com.juku.controller;

import com.juku.dto.GuardianRequest;
import com.juku.dto.GuardianResponse;
import com.juku.dto.StudentResponse;
import com.juku.repository.StudentRepository;
import com.juku.service.GuardianService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guardians")
@RequiredArgsConstructor
public class GuardianController {

    private final GuardianService guardianService;
    private final StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<List<GuardianResponse>> findAll(@RequestParam(required = false) String name) {
        return ResponseEntity.ok(guardianService.findAll(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuardianResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(guardianService.findById(id));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<StudentResponse>> getStudents(@PathVariable Long id) {
        return ResponseEntity.ok(
            studentRepository.findAll().stream()
                .filter(s -> s.getGuardian() != null && s.getGuardian().getId().equals(id))
                .map(StudentResponse::new)
                .toList()
        );
    }

    @PostMapping
    public ResponseEntity<GuardianResponse> create(@Valid @RequestBody GuardianRequest request) {
        return ResponseEntity.ok(guardianService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GuardianResponse> update(@PathVariable Long id, @Valid @RequestBody GuardianRequest request) {
        return ResponseEntity.ok(guardianService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        guardianService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
