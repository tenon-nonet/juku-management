package com.juku.dto;

import com.juku.entity.Prospect;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class ProspectResponse {
    private final Long id;
    private final String fullName;
    private final String fullNameKana;
    private final String phone;
    private final String email;
    private final String grade;
    private final String schoolName;
    private final LocalDate inquiryDate;
    private final LocalDate trialDate;
    private final String status;
    private final String interestCourses;
    private final String referralSource;
    private final String memo;
    private final Long assignedStaffId;
    private final String assignedStaffName;
    private final Long enrolledStudentId;
    private final LocalDateTime createdAt;

    public ProspectResponse(Prospect p) {
        this.id = p.getId();
        this.fullName = p.getFullName();
        this.fullNameKana = p.getFullNameKana();
        this.phone = p.getPhone();
        this.email = p.getEmail();
        this.grade = p.getGrade();
        this.schoolName = p.getSchoolName();
        this.inquiryDate = p.getInquiryDate();
        this.trialDate = p.getTrialDate();
        this.status = p.getStatus().name();
        this.interestCourses = p.getInterestCourses();
        this.referralSource = p.getReferralSource();
        this.memo = p.getMemo();
        this.assignedStaffId = p.getAssignedStaff() != null ? p.getAssignedStaff().getId() : null;
        this.assignedStaffName = p.getAssignedStaff() != null ? p.getAssignedStaff().getFullName() : null;
        this.enrolledStudentId = p.getEnrolledStudent() != null ? p.getEnrolledStudent().getId() : null;
        this.createdAt = p.getCreatedAt();
    }
}
