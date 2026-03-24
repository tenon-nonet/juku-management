package com.juku.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_results")
@Getter
@Setter
public class ExamResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_type_id")
    private ExamType examType;

    @Column(nullable = false, length = 100)
    private String examName;

    @Column(nullable = false)
    private LocalDate examDate;

    @Column(nullable = false, precision = 5, scale = 1)
    private BigDecimal score;

    @Column(nullable = false, precision = 5, scale = 1)
    private BigDecimal maxScore = BigDecimal.valueOf(100);

    private Integer rank;

    private Integer totalStudents;

    @Column(columnDefinition = "TEXT")
    private String memo;

    private Integer academicYear;

    private Short semester; // 1=1学期, 2=2学期, 3=3学期

    @Column(length = 20)
    private String gradeAtExam; // 受験時の学年（例: 中1, 高2）

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
