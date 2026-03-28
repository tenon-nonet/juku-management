package com.juku.service;

import com.juku.dto.LessonRequest;
import com.juku.dto.LessonResponse;
import com.juku.entity.Lesson;
import com.juku.repository.CourseRepository;
import com.juku.repository.LessonRepository;
import com.juku.repository.StaffRepository;
import com.juku.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;

    public List<LessonResponse> findByFilters(LocalDateTime from, LocalDateTime to, Long courseId, Long teacherId, Long studentId) {
        return lessonRepository.findByFilters(from, to, courseId, teacherId, studentId)
            .stream().map(LessonResponse::new).toList();
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

    @Transactional
    public LessonResponse reschedule(Long id, LocalDateTime scheduledAt) {
        Lesson l = lessonRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        l.setScheduledAt(scheduledAt);
        return new LessonResponse(lessonRepository.save(l));
    }

    @Transactional
    public List<LessonResponse> bulkCreate(LessonRequest req, int repeatWeeks) {
        int weeks = Math.max(1, Math.min(repeatWeeks, 52));
        LocalDateTime base = req.getScheduledAt();
        List<LessonResponse> results = new ArrayList<>();
        for (int w = 0; w < weeks; w++) {
            req.setScheduledAt(base.plusWeeks(w));
            Lesson l = new Lesson();
            applyRequest(l, req);
            results.add(new LessonResponse(lessonRepository.save(l)));
        }
        return results;
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
        if (req.getStudentId() != null) {
            var student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student not found"));
            l.setStudent(student);
        } else {
            l.setStudent(null);
        }
    }
}
