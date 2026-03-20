package com.juku.controller;

import com.juku.dto.AuthResponse;
import com.juku.dto.LoginRequest;
import com.juku.dto.StaffResponse;
import com.juku.repository.StaffRepository;
import com.juku.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final StaffRepository staffRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<StaffResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        var staff = staffRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(new StaffResponse(staff));
    }
}
