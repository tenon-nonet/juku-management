package com.juku.service;

import com.juku.dto.AbsenceRequestDto;
import com.juku.entity.AbsenceRequest;
import com.juku.repository.AbsenceRequestRepository;
import com.juku.repository.LessonRepository;
import com.juku.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AbsenceRequestService {

    private final AbsenceRequestRepository repo;
    private final StudentRepository studentRepository;
    private final LessonRepository lessonRepository;

    public List<AbsenceRequestDto> findByStudent(Long studentId) {
        return repo.findByStudentIdOrderByAbsenceDateDesc(studentId)
                .stream().map(AbsenceRequestDto::new).toList();
    }

    public List<AbsenceRequestDto> findPending() {
        return repo.findByStatusOrderByAbsenceDateDesc(AbsenceRequest.Status.PENDING)
                .stream().map(AbsenceRequestDto::new).toList();
    }

    @Transactional
    public AbsenceRequestDto create(AbsenceRequestDto req) {
        AbsenceRequest r = new AbsenceRequest();
        r.setStudent(studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST)));
        if (req.getLessonId() != null) {
            r.setLesson(lessonRepository.findById(req.getLessonId()).orElse(null));
        }
        r.setAbsenceDate(req.getAbsenceDate());
        r.setReason(req.getReason());
        r.setWantsMakeup(req.isWantsMakeup());
        return new AbsenceRequestDto(repo.save(r));
    }

    @Transactional
    public AbsenceRequestDto updateStatus(Long id, String status, Long makeupLessonId) {
        AbsenceRequest r = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        r.setStatus(AbsenceRequest.Status.valueOf(status));
        if (makeupLessonId != null) {
            r.setMakeupLesson(lessonRepository.findById(makeupLessonId).orElse(null));
        }
        return new AbsenceRequestDto(repo.save(r));
    }
}
