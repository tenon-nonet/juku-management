package com.juku.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "target_schools")
@Getter
@Setter
public class TargetSchool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String schoolName;

    @Column(nullable = false, length = 30)
    private String schoolType = "HIGHSCHOOL"; // ELEMENTARY, JUNIOR, HIGHSCHOOL, UNIVERSITY

    @Column(length = 50)
    private String region;

    private Short difficulty; // 1-5

    @Column(columnDefinition = "TEXT")
    private String memo;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
