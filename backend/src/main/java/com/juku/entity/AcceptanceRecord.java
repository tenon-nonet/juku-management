package com.juku.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "acceptance_records")
@Getter
@Setter
public class AcceptanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_school_id", nullable = false)
    private TargetSchool targetSchool;

    @Column(nullable = false)
    private Integer academicYear;

    @Column(nullable = false, length = 20)
    private String result = "ACCEPTED"; // ACCEPTED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
