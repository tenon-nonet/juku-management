package com.juku.controller;

import com.juku.entity.AcceptanceRecord;
import com.juku.repository.AcceptanceRecordRepository;
import com.juku.repository.StudentRepository;
import com.juku.repository.TargetSchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/acceptance-records")
@RequiredArgsConstructor
public class AcceptanceRecordController {

    private final AcceptanceRecordRepository acceptanceRecordRepository;
    private final StudentRepository studentRepository;
    private final TargetSchoolRepository targetSchoolRepository;

    @GetMapping
    public ResponseEntity<List<AcceptanceRecord>> getAll(
            @RequestParam(required = false) Long schoolId,
            @RequestParam(required = false) Long studentId) {
        if (schoolId != null) {
            return ResponseEntity.ok(acceptanceRecordRepository.findByTargetSchoolIdOrderByAcademicYearDesc(schoolId));
        }
        if (studentId != null) {
            return ResponseEntity.ok(acceptanceRecordRepository.findByStudentId(studentId));
        }
        return ResponseEntity.ok(acceptanceRecordRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ResponseEntity<AcceptanceRecord> create(@RequestBody Map<String, Object> body) {
        AcceptanceRecord r = new AcceptanceRecord();
        if (body.get("studentId") != null) {
            studentRepository.findById(Long.parseLong(body.get("studentId").toString())).ifPresent(r::setStudent);
        }
        Long schoolId = Long.parseLong(body.get("targetSchoolId").toString());
        r.setTargetSchool(targetSchoolRepository.findById(schoolId)
            .orElseThrow(() -> new RuntimeException("School not found")));
        r.setAcademicYear(Integer.parseInt(body.get("academicYear").toString()));
        r.setResult(body.getOrDefault("result", "ACCEPTED").toString());
        if (body.get("note") != null) r.setNote(body.get("note").toString());
        return ResponseEntity.ok(acceptanceRecordRepository.save(r));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        acceptanceRecordRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
