package com.juku.service;

import com.juku.dto.ConsultationRequest;
import com.juku.dto.ConsultationResponse;
import com.juku.entity.ConsultationRecord;
import com.juku.repository.ConsultationRecordRepository;
import com.juku.repository.StaffRepository;
import com.juku.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRecordRepository repo;
    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;

    public List<ConsultationResponse> findByStudent(Long studentId) {
        return repo.findByStudentIdOrderByConsultationDateDesc(studentId)
                .stream().map(ConsultationResponse::new).toList();
    }

    @Transactional
    public ConsultationResponse create(ConsultationRequest req) {
        ConsultationRecord r = new ConsultationRecord();
        apply(r, req);
        return new ConsultationResponse(repo.save(r));
    }

    @Transactional
    public ConsultationResponse update(Long id, ConsultationRequest req) {
        ConsultationRecord r = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        apply(r, req);
        return new ConsultationResponse(repo.save(r));
    }

    public void delete(Long id) { repo.deleteById(id); }

    private void apply(ConsultationRecord r, ConsultationRequest req) {
        r.setStudent(studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST)));
        r.setConsultationDate(req.getConsultationDate());
        r.setAttendees(req.getAttendees());
        r.setContent(req.getContent());
        r.setActionItems(req.getActionItems());
        r.setNextDate(req.getNextDate());
        if (req.getStaffId() != null) {
            r.setStaff(staffRepository.findById(req.getStaffId()).orElse(null));
        }
    }
}
