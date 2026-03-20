package com.juku.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ExamResultRequest {
    @NotNull
    private Long studentId;
    @NotNull
    private Long subjectId;
    private Long examTypeId;
    @NotBlank
    private String examName;
    @NotNull
    private LocalDate examDate;
    @NotNull
    private BigDecimal score;
    private BigDecimal maxScore = BigDecimal.valueOf(100);
    private Integer rank;
    private Integer totalStudents;
    private String memo;
}
