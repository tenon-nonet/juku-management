package com.juku.service;

import com.juku.dto.StudentRequest;
import com.juku.dto.StudentResponse;
import com.juku.entity.Guardian;
import com.juku.entity.Student;
import com.juku.repository.GuardianRepository;
import com.juku.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final GuardianRepository guardianRepository;

    public List<StudentResponse> search(String name, String grade, String status) {
        Student.Status statusEnum = status != null ? Student.Status.valueOf(status) : null;
        return studentRepository.search(name, grade, statusEnum)
            .stream().map(StudentResponse::new).toList();
    }

    public StudentResponse findById(Long id) {
        return studentRepository.findById(id)
            .map(StudentResponse::new)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public StudentResponse create(StudentRequest req) {
        Student s = new Student();
        applyRequest(s, req);
        return new StudentResponse(studentRepository.save(s));
    }

    public StudentResponse update(Long id, StudentRequest req) {
        Student s = studentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        applyRequest(s, req);
        return new StudentResponse(studentRepository.save(s));
    }

    public void delete(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        studentRepository.deleteById(id);
    }

    private void applyRequest(Student s, StudentRequest req) {
        s.setFullName(req.getFullName());
        s.setFullNameKana(req.getFullNameKana());
        s.setBirthDate(req.getBirthDate());
        s.setGrade(req.getGrade());
        s.setSchoolName(req.getSchoolName());
        s.setMemo(req.getMemo());
        if (req.getStatus() != null) {
            s.setStatus(Student.Status.valueOf(req.getStatus()));
        }
        if (req.getEnrolledAt() != null) {
            s.setEnrolledAt(req.getEnrolledAt());
        }
        s.setLeftAt(req.getLeftAt());
        if (req.getGuardianId() != null) {
            Guardian guardian = guardianRepository.findById(req.getGuardianId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guardian not found"));
            s.setGuardian(guardian);
        } else {
            s.setGuardian(null);
        }
    }
}
