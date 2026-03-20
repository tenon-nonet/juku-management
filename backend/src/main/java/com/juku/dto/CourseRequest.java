package com.juku.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseRequest {
    @NotBlank
    private String name;
    private Long subjectId;
    private String gradeTarget;
    private int monthlyFee;
    private String description;
    private boolean isActive = true;
}
