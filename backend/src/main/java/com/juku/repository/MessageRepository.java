package com.juku.repository;

import com.juku.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByThreadIdOrderByCreatedAtAsc(Long threadId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.thread.id = :threadId AND m.isRead = false AND m.senderType != :senderType")
    long countUnreadForSender(@Param("threadId") Long threadId, @Param("senderType") String senderType);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.isRead = false AND m.senderType != :senderType")
    long countAllUnreadForSender(@Param("senderType") String senderType);
}
