package com.juku.service;

import com.juku.dto.LessonRequest;
import com.juku.dto.LessonResponse;
import com.juku.entity.Lesson;
import com.juku.repository.CourseRepository;
import com.juku.repository.LessonRepository;
import com.juku.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final StaffRepository staffRepository;

    public List<LessonResponse> findByDateRange(LocalDateTime from, LocalDateTime to, Long courseId) {
        if (courseId != null) {
            return lessonRepository.findByDateRangeAndCourse(from, to, courseId)
                .stream().map(LessonResponse::new).toList();
        }
        return lessonRepository.findByDateRange(from, to).stream().map(LessonResponse::new).toList();
    }

    public LessonResponse findById(Long id) {
        return lessonRepository.findById(id)
            .map(LessonResponse::new)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public LessonResponse create(LessonRequest req) {
        Lesson l = new Lesson();
        applyRequest(l, req);
        return new LessonResponse(lessonRepository.save(l));
    }

    public LessonResponse update(Long id, LessonRequest req) {
        Lesson l = lessonRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        applyRequest(l, req);
        return new LessonResponse(lessonRepository.save(l));
    }

    public void delete(Long id) {
        if (!lessonRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        lessonRepository.deleteById(id);
    }

    private void applyRequest(Lesson l, LessonRequest req) {
        var course = courseRepository.findById(req.getCourseId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course not found"));
        l.setCourse(course);
        l.setScheduledAt(req.getScheduledAt());
        l.setDurationMin(req.getDurationMin() > 0 ? req.getDurationMin() : 60);
        l.setClassroom(req.getClassroom());
        l.setNote(req.getNote());
        if (req.getStatus() != null) {
            l.setStatus(Lesson.Status.valueOf(req.getStatus()));
        }
        if (req.getTeacherId() != null) {
            var teacher = staffRepository.findById(req.getTeacherId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Teacher not found"));
            l.setTeacher(teacher);
        } else {
            l.setTeacher(null);
        }
    }
}
