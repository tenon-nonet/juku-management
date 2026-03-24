package com.juku.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "feature_flags")
@Getter
@Setter
public class FeatureFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "feature_key", unique = true, nullable = false, length = 60)
    private String featureKey;

    @Column(nullable = false)
    private Boolean isEnabled = false;

    @Column(nullable = false, length = 30)
    private String planLevel = "BASIC";

    @Column(length = 200)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private Staff updatedBy;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
