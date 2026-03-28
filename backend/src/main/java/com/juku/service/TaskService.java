package com.juku.service;

import com.juku.entity.Task;
import com.juku.repository.TaskRepository;
import com.juku.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final StaffRepository staffRepository;

    public record TaskDto(
        Long id, String title, String description,
        String priority, String status,
        String dueDate, Long assigneeId, String assigneeName,
        String createdAt
    ) {}

    public List<TaskDto> findAll(String statusFilter) {
        List<Task> tasks;
        if (statusFilter == null || statusFilter.isBlank()) {
            tasks = taskRepository.findAllByOrderByDueDateAscCreatedAtDesc();
        } else if (statusFilter.equals("ACTIVE")) {
            tasks = taskRepository.findByStatusInOrderByDueDateAscCreatedAtDesc(
                List.of(Task.Status.TODO, Task.Status.IN_PROGRESS));
        } else {
            try {
                tasks = taskRepository.findByStatusOrderByDueDateAscCreatedAtDesc(Task.Status.valueOf(statusFilter));
            } catch (IllegalArgumentException e) {
                tasks = taskRepository.findAllByOrderByDueDateAscCreatedAtDesc();
            }
        }
        return tasks.stream().map(this::toDto).toList();
    }

    public TaskDto create(Map<String, Object> body) {
        Task task = new Task();
        applyBody(task, body);
        return toDto(taskRepository.save(task));
    }

    public TaskDto update(Long id, Map<String, Object> body) {
        Task task = taskRepository.findById(id).orElseThrow();
        applyBody(task, body);
        return toDto(taskRepository.save(task));
    }

    public void delete(Long id) {
        taskRepository.deleteById(id);
    }

    private void applyBody(Task task, Map<String, Object> body) {
        if (body.containsKey("title")) task.setTitle((String) body.get("title"));
        if (body.containsKey("description")) task.setDescription((String) body.get("description"));
        if (body.containsKey("priority")) task.setPriority(Task.Priority.valueOf((String) body.get("priority")));
        if (body.containsKey("status")) task.setStatus(Task.Status.valueOf((String) body.get("status")));
        if (body.containsKey("dueDate")) {
            String d = (String) body.get("dueDate");
            task.setDueDate(d != null && !d.isBlank() ? LocalDate.parse(d) : null);
        }
        if (body.containsKey("assigneeId")) {
            Object aid = body.get("assigneeId");
            if (aid != null) {
                Long staffId = Long.valueOf(aid.toString());
                staffRepository.findById(staffId).ifPresent(task::setAssignee);
            } else {
                task.setAssignee(null);
            }
        }
    }

    private TaskDto toDto(Task t) {
        return new TaskDto(
            t.getId(), t.getTitle(), t.getDescription(),
            t.getPriority().name(), t.getStatus().name(),
            t.getDueDate() != null ? t.getDueDate().toString() : null,
            t.getAssignee() != null ? t.getAssignee().getId() : null,
            t.getAssignee() != null ? t.getAssignee().getFullName() : null,
            t.getCreatedAt() != null ? t.getCreatedAt().toString() : null
        );
    }
}
