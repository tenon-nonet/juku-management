package com.juku.service;

import com.juku.dto.LessonResponse;
import com.juku.dto.StaffRequest;
import com.juku.dto.StaffResponse;
import com.juku.dto.StudentResponse;
import com.juku.entity.Staff;
import com.juku.entity.Subject;
import com.juku.repository.LessonRepository;
import com.juku.repository.StaffRepository;
import com.juku.repository.StudentRepository;
import com.juku.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final LessonRepository lessonRepository;

    public List<StaffResponse> findAll() {
        return staffRepository.findAll().stream().map(StaffResponse::new).toList();
    }

    public StaffResponse findById(Long id) {
        return staffRepository.findById(id)
            .map(StaffResponse::new)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public StaffResponse create(StaffRequest req) {
        if (staffRepository.existsByUsername(req.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        Staff staff = new Staff();
        staff.setUsername(req.getUsername());
        staff.setPassword(passwordEncoder.encode(req.getPassword()));
        applyRequest(staff, req);
        return new StaffResponse(staffRepository.save(staff));
    }

    @Transactional
    public StaffResponse update(Long id, StaffRequest req) {
        Staff staff = staffRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            staff.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        applyRequest(staff, req);
        return new StaffResponse(staffRepository.save(staff));
    }

    public void delete(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        staffRepository.deleteById(id);
    }

    public List<StudentResponse> getAssignedStudents(Long staffId) {
        return studentRepository.findByPrimaryTeacherId(staffId)
            .stream().map(StudentResponse::new).toList();
    }

    public List<LessonResponse> getUpcomingLessons(Long staffId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneMonthLater = now.plusMonths(1);
        return lessonRepository.findByTeacherIdAndScheduledAtBetweenOrderByScheduledAtAsc(staffId, now, oneMonthLater)
            .stream().map(LessonResponse::new).toList();
    }

    private void applyRequest(Staff staff, StaffRequest req) {
        staff.setFullName(req.getFullName());
        if (req.getRole() != null) {
            staff.setRole(Staff.Role.valueOf(req.getRole()));
        }
        staff.setActive(req.isActive());
        staff.setMemo(req.getMemo());
        if (req.getSubjectIds() != null) {
            List<Subject> subjects = subjectRepository.findAllById(req.getSubjectIds());
            staff.setSubjects(subjects);
        }
    }
}
