package com.juku.service;

import com.juku.entity.*;
import com.juku.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageThreadRepository threadRepository;
    private final MessageRepository messageRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final GuardianRepository guardianRepository;

    public List<MessageThread> getThreadsForUser(String username, String userType) {
        return switch (userType) {
            case "STUDENT" -> {
                var student = studentRepository.findByUsername(username).orElse(null);
                if (student == null) yield List.of();
                yield threadRepository.findByStudentIdOrderByUpdatedAtDesc(student.getId());
            }
            case "GUARDIAN" -> {
                var guardian = guardianRepository.findByUsername(username).orElse(null);
                if (guardian == null) yield List.of();
                yield threadRepository.findByCreatedByGuardianIdOrderByUpdatedAtDesc(guardian.getId());
            }
            default -> threadRepository.findAllByOrderByUpdatedAtDesc();
        };
    }

    public List<Message> getMessages(Long threadId) {
        return messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    }

    @Transactional
    public MessageThread createThread(String subject, String category, Long studentId,
                                      String username, String userType) {
        var thread = new MessageThread();
        thread.setSubject(subject);
        thread.setCategory(category != null ? category : "GENERAL");

        if (studentId != null) {
            studentRepository.findById(studentId).ifPresent(thread::setStudent);
        }

        if ("STUDENT".equals(userType)) {
            studentRepository.findByUsername(username).ifPresent(thread::setCreatedByStudent);
        } else if ("GUARDIAN".equals(userType)) {
            guardianRepository.findByUsername(username).ifPresent(thread::setCreatedByGuardian);
        } else {
            staffRepository.findByUsername(username).ifPresent(thread::setCreatedByStaff);
        }

        return threadRepository.save(thread);
    }

    @Transactional
    public Message addMessage(Long threadId, String content, String username, String userType) {
        var thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found: " + threadId));

        var message = new Message();
        message.setThread(thread);
        message.setContent(content);
        message.setSenderType(userType);

        if ("STUDENT".equals(userType)) {
            studentRepository.findByUsername(username).ifPresent(message::setSenderStudent);
        } else if ("GUARDIAN".equals(userType)) {
            guardianRepository.findByUsername(username).ifPresent(message::setSenderGuardian);
        } else {
            staffRepository.findByUsername(username).ifPresent(message::setSenderStaff);
        }

        // Update thread timestamp
        threadRepository.save(thread);
        return messageRepository.save(message);
    }

    public long getUnreadCount(String username, String userType) {
        String senderType = userType != null ? userType : "STAFF";
        return messageRepository.countAllUnreadForSender(senderType);
    }
}
