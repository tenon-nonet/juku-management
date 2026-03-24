package com.juku.controller;

import com.juku.dto.ConsultationRequest;
import com.juku.dto.ConsultationResponse;
import com.juku.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @GetMapping("/student/{studentId}")
    public List<ConsultationResponse> byStudent(@PathVariable Long studentId) {
        return consultationService.findByStudent(studentId);
    }

    @PostMapping
    public ConsultationResponse create(@RequestBody ConsultationRequest req) {
        return consultationService.create(req);
    }

    @PutMapping("/{id}")
    public ConsultationResponse update(@PathVariable Long id, @RequestBody ConsultationRequest req) {
        return consultationService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        consultationService.delete(id);
    }
}
