package com.juku.service;

import com.juku.dto.StudentCourseResponse;
import com.juku.entity.StudentCourse;
import com.juku.repository.CourseRepository;
import com.juku.repository.StudentCourseRepository;
import com.juku.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentCourseService {

    private final StudentCourseRepository studentCourseRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public List<StudentCourseResponse> findByStudent(Long studentId) {
        return studentCourseRepository.findByStudentId(studentId)
            .stream().map(StudentCourseResponse::new).toList();
    }

    public StudentCourseResponse enroll(Long studentId, Long courseId) {
        var student = studentRepository.findById(studentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course not found"));

        StudentCourse sc = new StudentCourse();
        sc.setStudent(student);
        sc.setCourse(course);
        return new StudentCourseResponse(studentCourseRepository.save(sc));
    }

    public void unenroll(Long id) {
        if (!studentCourseRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        studentCourseRepository.deleteById(id);
    }
}
