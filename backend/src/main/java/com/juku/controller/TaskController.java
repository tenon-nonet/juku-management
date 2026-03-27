package com.juku.controller;

import com.juku.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<TaskService.TaskDto> list(@RequestParam(required = false) String status) {
        return taskService.findAll(status);
    }

    @PostMapping
    public TaskService.TaskDto create(@RequestBody Map<String, Object> body) {
        return taskService.create(body);
    }

    @PutMapping("/{id}")
    public TaskService.TaskDto update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return taskService.update(id, body);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }
}
