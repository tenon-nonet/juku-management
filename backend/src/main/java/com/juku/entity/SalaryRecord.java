package com.juku.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "salary_records")
@Getter @Setter
public class SalaryRecord {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @Column(nullable = false, length = 7)
    private String salaryMonth; // YYYY-MM

    @Column(nullable = false)
    private int lessonCount = 0;

    @Column(nullable = false)
    private int baseAmount = 0;

    @Column(nullable = false)
    private int adjustment = 0;

    @Column(nullable = false)
    private int totalAmount = 0;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.DRAFT;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;

    public enum Status { DRAFT, CONFIRMED, PAID }
}
