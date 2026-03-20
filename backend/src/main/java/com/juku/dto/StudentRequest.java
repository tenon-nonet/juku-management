package com.juku.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StudentRequest {
    @NotBlank
    private String fullName;
    private String fullNameKana;
    private LocalDate birthDate;
    @NotBlank
    private String grade;
    private String schoolName;
    private Long guardianId;
    private String status;
    private LocalDate enrolledAt;
    private LocalDate leftAt;
    private String memo;
}
