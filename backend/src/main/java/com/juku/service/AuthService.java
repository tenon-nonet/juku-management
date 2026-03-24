package com.juku.service;

import com.juku.dto.AuthResponse;
import com.juku.dto.LoginRequest;
import com.juku.repository.GuardianRepository;
import com.juku.repository.StaffRepository;
import com.juku.repository.StudentRepository;
import com.juku.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final GuardianRepository guardianRepository;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // Determine entity type and generate enriched token
        var staffOpt = staffRepository.findByUsername(request.getUsername());
        if (staffOpt.isPresent()) {
            var staff = staffOpt.get();
            String token = jwtUtil.generateToken(userDetails, staff.getId(), "STAFF", staff.getRole().name());
            return new AuthResponse(token, staff.getUsername(), staff.getRole().name(), staff.getFullName(), staff.getId(), "STAFF");
        }

        var studentOpt = studentRepository.findByUsername(request.getUsername());
        if (studentOpt.isPresent()) {
            var student = studentOpt.get();
            String token = jwtUtil.generateToken(userDetails, student.getId(), "STUDENT", "STUDENT");
            return new AuthResponse(token, student.getUsername(), "STUDENT", student.getFullName(), student.getId(), "STUDENT");
        }

        var guardianOpt = guardianRepository.findByUsername(request.getUsername());
        if (guardianOpt.isPresent()) {
            var guardian = guardianOpt.get();
            String token = jwtUtil.generateToken(userDetails, guardian.getId(), "GUARDIAN", "GUARDIAN");
            return new AuthResponse(token, guardian.getUsername(), "GUARDIAN", guardian.getFullName(), guardian.getId(), "GUARDIAN");
        }

        throw new RuntimeException("User not found after authentication");
    }
}
