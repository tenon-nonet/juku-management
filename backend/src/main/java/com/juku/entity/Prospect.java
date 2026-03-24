package com.juku.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "prospects")
@Getter @Setter
public class Prospect {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String fullName;

    @Column(length = 50)
    private String fullNameKana;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String grade;

    @Column(length = 100)
    private String schoolName;

    @Column(nullable = false)
    private LocalDate inquiryDate = LocalDate.now();

    private LocalDate trialDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.INQUIRY;

    @Column(columnDefinition = "TEXT")
    private String interestCourses;

    @Column(length = 50)
    private String referralSource;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private Staff assignedStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrolled_student_id")
    private Student enrolledStudent;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;

    public enum Status {
        INQUIRY, TRIAL_SCHEDULED, TRIAL_DONE, ENROLLED, DROPPED
    }
}
