package com.juku.controller;

import com.juku.dto.LessonPackRequest;
import com.juku.dto.LessonPackResponse;
import com.juku.dto.StudentLessonPackResponse;
import com.juku.service.LessonPackService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lesson-packs")
@RequiredArgsConstructor
public class LessonPackController {

    private final LessonPackService lessonPackService;

    @GetMapping
    public List<LessonPackResponse> list(@RequestParam(defaultValue = "false") boolean activeOnly) {
        return lessonPackService.findAll(activeOnly);
    }

    @GetMapping("/{id}")
    public LessonPackResponse get(@PathVariable Long id) {
        return lessonPackService.findById(id);
    }

    @PostMapping
    public LessonPackResponse create(@RequestBody LessonPackRequest req) {
        return lessonPackService.create(req);
    }

    @PutMapping("/{id}")
    public LessonPackResponse update(@PathVariable Long id, @RequestBody LessonPackRequest req) {
        return lessonPackService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        lessonPackService.delete(id);
    }

    @PostMapping("/{id}/assign")
    public StudentLessonPackResponse assign(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        int sessions = body.containsKey("sessions") ? Integer.parseInt(body.get("sessions").toString()) : 0;
        return lessonPackService.assignToStudent(id, studentId, sessions);
    }

    @GetMapping("/student/{studentId}")
    public List<StudentLessonPackResponse> getStudentPacks(@PathVariable Long studentId) {
        return lessonPackService.getStudentPacks(studentId);
    }
}
