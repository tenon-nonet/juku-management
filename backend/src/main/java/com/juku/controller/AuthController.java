package com.juku.controller;

import com.juku.dto.AuthResponse;
import com.juku.dto.LoginRequest;
import com.juku.repository.GuardianRepository;
import com.juku.repository.StaffRepository;
import com.juku.repository.StudentRepository;
import com.juku.security.JwtUtil;
import com.juku.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final GuardianRepository guardianRepository;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        String userType = jwtUtil.extractUserType(token);
        Long userId = jwtUtil.extractUserId(token);
        String role = jwtUtil.extractRole(token);

        Map<String, Object> result = new HashMap<>();
        result.put("username", username);
        result.put("userType", userType != null ? userType : "STAFF");
        result.put("userId", userId);
        result.put("role", role);

        if ("STUDENT".equals(userType)) {
            studentRepository.findByUsername(username).ifPresent(s -> {
                result.put("fullName", s.getFullName());
                result.put("studentId", s.getId());
            });
        } else if ("GUARDIAN".equals(userType)) {
            guardianRepository.findByUsername(username).ifPresent(g -> {
                result.put("fullName", g.getFullName());
                result.put("guardianId", g.getId());
            });
        } else {
            staffRepository.findByUsername(username).ifPresent(s -> {
                result.put("fullName", s.getFullName());
                result.put("staffId", s.getId());
                result.put("isActive", s.isActive());
            });
        }
        return ResponseEntity.ok(result);
    }
}
