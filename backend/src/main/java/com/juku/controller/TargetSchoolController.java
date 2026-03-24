package com.juku.controller;

import com.juku.entity.TargetSchool;
import com.juku.repository.TargetSchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/target-schools")
@RequiredArgsConstructor
public class TargetSchoolController {

    private final TargetSchoolRepository targetSchoolRepository;

    @GetMapping
    public ResponseEntity<List<TargetSchool>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String name) {
        if (name != null && !name.isEmpty()) {
            return ResponseEntity.ok(targetSchoolRepository.findBySchoolNameContainingIgnoreCase(name));
        }
        if (type != null && !type.isEmpty()) {
            return ResponseEntity.ok(targetSchoolRepository.findBySchoolTypeOrderByDifficultyDesc(type));
        }
        return ResponseEntity.ok(targetSchoolRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<TargetSchool> create(@RequestBody TargetSchool school) {
        return ResponseEntity.ok(targetSchoolRepository.save(school));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<TargetSchool> update(@PathVariable Long id, @RequestBody TargetSchool updated) {
        var school = targetSchoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found: " + id));
        school.setSchoolName(updated.getSchoolName());
        school.setSchoolType(updated.getSchoolType());
        school.setRegion(updated.getRegion());
        school.setDifficulty(updated.getDifficulty());
        school.setMemo(updated.getMemo());
        return ResponseEntity.ok(targetSchoolRepository.save(school));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        targetSchoolRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
