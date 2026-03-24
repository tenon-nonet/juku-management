package com.juku.repository;

import com.juku.entity.MessageThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageThreadRepository extends JpaRepository<MessageThread, Long> {
    List<MessageThread> findByStudentIdOrderByUpdatedAtDesc(Long studentId);
    List<MessageThread> findAllByOrderByUpdatedAtDesc();
    List<MessageThread> findByCreatedByStaffIdOrderByUpdatedAtDesc(Long staffId);
    List<MessageThread> findByCreatedByStudentIdOrderByUpdatedAtDesc(Long studentId);
    List<MessageThread> findByCreatedByGuardianIdOrderByUpdatedAtDesc(Long guardianId);
}
