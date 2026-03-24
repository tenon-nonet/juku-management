package com.juku.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class StaffRequest {
    @NotBlank
    private String username;

    private String password;

    @NotBlank
    private String fullName;

    private String role;

    private boolean isActive = true;

    private String memo;

    private List<Long> subjectIds;
}
