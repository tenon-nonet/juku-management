package com.juku.controller;

import com.juku.dto.LessonResponse;
import com.juku.dto.StaffRequest;
import com.juku.dto.StaffResponse;
import com.juku.dto.StudentResponse;
import com.juku.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<List<StaffResponse>> findAll() {
        return ResponseEntity.ok(staffService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.findById(id));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<StudentResponse>> getAssignedStudents(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getAssignedStudents(id));
    }

    @GetMapping("/{id}/lessons")
    public ResponseEntity<List<LessonResponse>> getUpcomingLessons(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getUpcomingLessons(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponse> create(@Valid @RequestBody StaffRequest request) {
        return ResponseEntity.ok(staffService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponse> update(@PathVariable Long id, @Valid @RequestBody StaffRequest request) {
        return ResponseEntity.ok(staffService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        staffService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
