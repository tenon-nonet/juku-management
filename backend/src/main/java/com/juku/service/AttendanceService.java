package com.juku.service;

import com.juku.dto.AttendanceResponse;
import com.juku.dto.AttendanceUpdateRequest;
import com.juku.entity.Attendance;
import com.juku.repository.AttendanceRepository;
import com.juku.repository.LessonRepository;
import com.juku.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final LessonRepository lessonRepository;
    private final StudentRepository studentRepository;

    public List<AttendanceResponse> findByLesson(Long lessonId) {
        return attendanceRepository.findByLessonId(lessonId)
            .stream().map(AttendanceResponse::new).toList();
    }

    public List<AttendanceResponse> findByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId)
            .stream().map(AttendanceResponse::new).toList();
    }

    @Transactional
    public List<AttendanceResponse> bulkUpdate(Long lessonId, AttendanceUpdateRequest req) {
        var lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        for (var entry : req.getAttendances()) {
            var student = studentRepository.findById(entry.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

            Attendance attendance = attendanceRepository
                .findByLessonIdAndStudentId(lessonId, entry.getStudentId())
                .orElse(new Attendance());

            attendance.setLesson(lesson);
            attendance.setStudent(student);
            attendance.setStatus(Attendance.Status.valueOf(entry.getStatus()));
            attendance.setNote(entry.getNote());
            attendance.setCheckedAt(LocalDateTime.now());
            attendanceRepository.save(attendance);
        }

        return attendanceRepository.findByLessonId(lessonId)
            .stream().map(AttendanceResponse::new).toList();
    }
}
