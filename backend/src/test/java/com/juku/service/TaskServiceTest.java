package com.juku.service;

import com.juku.entity.Task;
import com.juku.repository.StaffRepository;
import com.juku.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private StaffRepository staffRepository;

    @InjectMocks
    private TaskService taskService;

    // -----------------------------------------------------------------------
    // findAll_activeFilter_returnsOnlyTodoAndInProgress
    // -----------------------------------------------------------------------
    @Test
    void findAll_activeFilter_returnsOnlyTodoAndInProgress() {
        // Given: ACTIVE フィルタ時にリポジトリが TODO と IN_PROGRESS の2件を返す
        Task todoTask = buildTask(1L, "タスクA", Task.Priority.MEDIUM, Task.Status.TODO);
        Task inProgressTask = buildTask(2L, "タスクB", Task.Priority.HIGH, Task.Status.IN_PROGRESS);

        when(taskRepository.findByStatusInOrderByDueDateAscCreatedAtDesc(
                List.of(Task.Status.TODO, Task.Status.IN_PROGRESS)))
                .thenReturn(List.of(todoTask, inProgressTask));

        // When
        List<TaskService.TaskDto> result = taskService.findAll("ACTIVE");

        // Then: 2件が返され、いずれも TODO または IN_PROGRESS
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(
                dto -> dto.status().equals("TODO") || dto.status().equals("IN_PROGRESS")));
    }

    // -----------------------------------------------------------------------
    // create_setsDefaultValues
    // -----------------------------------------------------------------------
    @Test
    void create_setsDefaultValues() {
        // Given: title のみ指定した body（priority・status は指定なし）
        Map<String, Object> body = Map.of("title", "新しいタスク");

        Task saved = buildTask(3L, "新しいタスク", Task.Priority.MEDIUM, Task.Status.TODO);
        when(taskRepository.save(any(Task.class))).thenReturn(saved);

        // When
        TaskService.TaskDto result = taskService.create(body);

        // Then: デフォルト優先度 MEDIUM・デフォルトステータス TODO が設定される
        assertEquals("新しいタスク", result.title());
        assertEquals("MEDIUM", result.priority());
        assertEquals("TODO", result.status());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    // -----------------------------------------------------------------------
    // update_changesStatus
    // -----------------------------------------------------------------------
    @Test
    void update_changesStatus() {
        // Given: 既存タスク（TODO）を IN_PROGRESS に更新
        Task existing = buildTask(4L, "既存タスク", Task.Priority.LOW, Task.Status.TODO);
        when(taskRepository.findById(4L)).thenReturn(Optional.of(existing));

        Task updated = buildTask(4L, "既存タスク", Task.Priority.LOW, Task.Status.IN_PROGRESS);
        when(taskRepository.save(any(Task.class))).thenReturn(updated);

        Map<String, Object> body = Map.of("status", "IN_PROGRESS");

        // When
        TaskService.TaskDto result = taskService.update(4L, body);

        // Then: ステータスが IN_PROGRESS に変わっている
        assertEquals("IN_PROGRESS", result.status());
        verify(taskRepository).save(existing);
    }

    // -----------------------------------------------------------------------
    // Helper methods
    // -----------------------------------------------------------------------

    private Task buildTask(Long id, String title, Task.Priority priority, Task.Status status) {
        Task t = new Task();
        t.setId(id);
        t.setTitle(title);
        t.setPriority(priority);
        t.setStatus(status);
        t.setDueDate(LocalDate.of(2026, 4, 30));
        return t;
    }
}
