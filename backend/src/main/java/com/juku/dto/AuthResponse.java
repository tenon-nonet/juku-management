package com.juku.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private String fullName;
    private Long userId;
    private String userType; // STAFF, STUDENT, GUARDIAN
}
