package com.juku.dto;

import com.juku.entity.Student;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class StudentResponse {
    private final Long id;
    private final String fullName;
    private final String fullNameKana;
    private final LocalDate birthDate;
    private final String grade;
    private final String schoolName;
    private final Long guardianId;
    private final String guardianName;
    private final String guardianPhone;
    private final Long primaryTeacherId;
    private final String primaryTeacherName;
    private final String status;
    private final LocalDate enrolledAt;
    private final LocalDate leftAt;
    private final String memo;
    private final LocalDateTime createdAt;

    public StudentResponse(Student s) {
        this.id = s.getId();
        this.fullName = s.getFullName();
        this.fullNameKana = s.getFullNameKana();
        this.birthDate = s.getBirthDate();
        this.grade = s.getGrade();
        this.schoolName = s.getSchoolName();
        this.guardianId = s.getGuardian() != null ? s.getGuardian().getId() : null;
        this.guardianName = s.getGuardian() != null ? s.getGuardian().getFullName() : null;
        this.guardianPhone = s.getGuardian() != null ? s.getGuardian().getPhone() : null;
        this.primaryTeacherId = s.getPrimaryTeacher() != null ? s.getPrimaryTeacher().getId() : null;
        this.primaryTeacherName = s.getPrimaryTeacher() != null ? s.getPrimaryTeacher().getFullName() : null;
        this.status = s.getStatus().name();
        this.enrolledAt = s.getEnrolledAt();
        this.leftAt = s.getLeftAt();
        this.memo = s.getMemo();
        this.createdAt = s.getCreatedAt();
    }
}
