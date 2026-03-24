package com.juku.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class ProspectRequest {
    private String fullName;
    private String fullNameKana;
    private String phone;
    private String email;
    private String grade;
    private String schoolName;
    private LocalDate inquiryDate;
    private LocalDate trialDate;
    private String status;
    private String interestCourses;
    private String referralSource;
    private String memo;
    private Long assignedStaffId;
    private Long enrolledStudentId;
}
