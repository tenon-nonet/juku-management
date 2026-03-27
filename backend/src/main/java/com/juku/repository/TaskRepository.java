package com.juku.repository;

import com.juku.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatusInOrderByDueDateAscCreatedAtDesc(List<Task.Status> statuses);
    List<Task> findByStatusOrderByDueDateAscCreatedAtDesc(Task.Status status);
    List<Task> findAllByOrderByDueDateAscCreatedAtDesc();
}
