package com.juku.service;

import com.juku.dto.LessonPackRequest;
import com.juku.dto.LessonPackResponse;
import com.juku.dto.StudentLessonPackResponse;
import com.juku.entity.LessonPack;
import com.juku.entity.StudentLessonPack;
import com.juku.repository.LessonPackRepository;
import com.juku.repository.StudentLessonPackRepository;
import com.juku.repository.StudentRepository;
import com.juku.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonPackService {

    private final LessonPackRepository packRepository;
    private final StudentLessonPackRepository studentPackRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public List<LessonPackResponse> findAll(boolean activeOnly) {
        var list = activeOnly ? packRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                              : packRepository.findAllByOrderByCreatedAtDesc();
        return list.stream().map(LessonPackResponse::new).toList();
    }

    public LessonPackResponse findById(Long id) {
        return packRepository.findById(id).map(LessonPackResponse::new)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public LessonPackResponse create(LessonPackRequest req) {
        LessonPack p = new LessonPack();
        apply(p, req);
        return new LessonPackResponse(packRepository.save(p));
    }

    @Transactional
    public LessonPackResponse update(Long id, LessonPackRequest req) {
        LessonPack p = packRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        apply(p, req);
        return new LessonPackResponse(packRepository.save(p));
    }

    public void delete(Long id) { packRepository.deleteById(id); }

    // 生徒へのパック付与
    @Transactional
    public StudentLessonPackResponse assignToStudent(Long packId, Long studentId, int sessions) {
        LessonPack pack = packRepository.findById(packId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pack not found"));
        var student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        StudentLessonPack sp = new StudentLessonPack();
        sp.setPack(pack);
        sp.setStudent(student);
        sp.setTotalSessions(sessions > 0 ? sessions : pack.getTotalSessions());
        sp.setPurchasedAt(LocalDate.now());
        return new StudentLessonPackResponse(studentPackRepository.save(sp));
    }

    public List<StudentLessonPackResponse> getStudentPacks(Long studentId) {
        return studentPackRepository.findByStudentIdOrderByPurchasedAtDesc(studentId)
                .stream().map(StudentLessonPackResponse::new).toList();
    }

    private void apply(LessonPack p, LessonPackRequest req) {
        p.setName(req.getName());
        if (req.getPackType() != null) p.setPackType(LessonPack.PackType.valueOf(req.getPackType()));
        p.setTotalSessions(req.getTotalSessions());
        p.setPrice(req.getPrice());
        if (req.getSubjectId() != null) {
            p.setSubject(subjectRepository.findById(req.getSubjectId()).orElse(null));
        }
        p.setValidFrom(req.getValidFrom());
        p.setValidTo(req.getValidTo());
        p.setDescription(req.getDescription());
        p.setActive(req.isActive());
    }
}
