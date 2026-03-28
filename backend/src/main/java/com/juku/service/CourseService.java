package com.juku.service;

import com.juku.dto.CourseRequest;
import com.juku.dto.CourseResponse;
import com.juku.entity.Course;
import com.juku.repository.CourseRepository;
import com.juku.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;

    public List<CourseResponse> findAll() {
        return courseRepository.findAllByOrderByNameAsc().stream().map(CourseResponse::new).toList();
    }

    public List<CourseResponse> findActive() {
        return courseRepository.findByIsActiveTrueOrderByNameAsc().stream().map(CourseResponse::new).toList();
    }

    public CourseResponse findById(Long id) {
        return courseRepository.findById(id)
            .map(CourseResponse::new)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public CourseResponse create(CourseRequest req) {
        Course c = new Course();
        applyRequest(c, req);
        return new CourseResponse(courseRepository.save(c));
    }

    public CourseResponse update(Long id, CourseRequest req) {
        Course c = courseRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        applyRequest(c, req);
        return new CourseResponse(courseRepository.save(c));
    }

    public void delete(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        courseRepository.deleteById(id);
    }

    private void applyRequest(Course c, CourseRequest req) {
        c.setName(req.getName());
        c.setGradeTarget(req.getGradeTarget());
        c.setMonthlyFee(req.getMonthlyFee());
        c.setDescription(req.getDescription());
        c.setActive(req.isActive());
        if (req.getSubjectId() != null) {
            var subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject not found"));
            c.setSubject(subject);
        } else {
            c.setSubject(null);
        }
    }
}
