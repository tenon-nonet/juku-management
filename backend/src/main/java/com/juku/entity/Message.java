package com.juku.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id", nullable = false)
    private MessageThread thread;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 20)
    private String senderType; // STAFF, STUDENT, GUARDIAN

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_staff_id")
    private Staff senderStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_student_id")
    private Student senderStudent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_guardian_id")
    private Guardian senderGuardian;

    @Column(nullable = false)
    private Boolean isRead = false;

    private LocalDateTime readAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
