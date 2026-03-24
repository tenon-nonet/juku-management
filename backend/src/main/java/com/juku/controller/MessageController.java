package com.juku.controller;

import com.juku.entity.Message;
import com.juku.entity.MessageThread;
import com.juku.security.JwtUtil;
import com.juku.security.RequiresFeature;
import com.juku.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@RequiresFeature("COMMUNICATION")
public class MessageController {

    private final MessageService messageService;
    private final JwtUtil jwtUtil;

    @GetMapping("/threads")
    public ResponseEntity<List<MessageThread>> getThreads(HttpServletRequest request) {
        String username = extractUsername(request);
        String userType = extractUserType(request);
        return ResponseEntity.ok(messageService.getThreadsForUser(username, userType));
    }

    @GetMapping("/threads/{threadId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long threadId) {
        return ResponseEntity.ok(messageService.getMessages(threadId));
    }

    @PostMapping("/threads")
    public ResponseEntity<MessageThread> createThread(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        String username = extractUsername(request);
        String userType = extractUserType(request);
        String subject = (String) body.get("subject");
        String category = (String) body.get("category");
        Long studentId = body.get("studentId") != null ? Long.parseLong(body.get("studentId").toString()) : null;
        return ResponseEntity.ok(messageService.createThread(subject, category, studentId, username, userType));
    }

    @PostMapping("/threads/{threadId}/messages")
    public ResponseEntity<Message> addMessage(
            @PathVariable Long threadId,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String username = extractUsername(request);
        String userType = extractUserType(request);
        return ResponseEntity.ok(messageService.addMessage(threadId, body.get("content"), username, userType));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(HttpServletRequest request) {
        String username = extractUsername(request);
        String userType = extractUserType(request);
        long count = messageService.getUnreadCount(username, userType);
        return ResponseEntity.ok(Map.of("count", count));
    }

    private String extractUsername(HttpServletRequest request) {
        String token = extractToken(request);
        return token != null ? jwtUtil.extractUsername(token) : null;
    }

    private String extractUserType(HttpServletRequest request) {
        String token = extractToken(request);
        return token != null ? jwtUtil.extractUserType(token) : "STAFF";
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
