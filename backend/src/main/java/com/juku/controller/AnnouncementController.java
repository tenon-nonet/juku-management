package com.juku.controller;

import com.juku.dto.AnnouncementRequest;
import com.juku.dto.AnnouncementResponse;
import com.juku.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<List<AnnouncementResponse>> findAll() {
        return ResponseEntity.ok(announcementService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AnnouncementResponse> create(
            @Valid @RequestBody AnnouncementRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(announcementService.create(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnouncementResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementRequest request) {
        return ResponseEntity.ok(announcementService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
