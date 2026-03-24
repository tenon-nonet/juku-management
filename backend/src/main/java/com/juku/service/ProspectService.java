package com.juku.service;

import com.juku.dto.ProspectRequest;
import com.juku.dto.ProspectResponse;
import com.juku.entity.Prospect;
import com.juku.repository.ProspectRepository;
import com.juku.repository.StaffRepository;
import com.juku.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProspectService {

    private final ProspectRepository prospectRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;

    public List<ProspectResponse> search(String status, String name) {
        Prospect.Status statusEnum = status != null ? Prospect.Status.valueOf(status) : null;
        return prospectRepository.search(statusEnum, name)
                .stream().map(ProspectResponse::new).toList();
    }

    public ProspectResponse findById(Long id) {
        return prospectRepository.findById(id)
                .map(ProspectResponse::new)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public Map<String, Long> getStatusCounts() {
        return prospectRepository.findAll().stream()
                .collect(Collectors.groupingBy(p -> p.getStatus().name(), Collectors.counting()));
    }

    @Transactional
    public ProspectResponse create(ProspectRequest req) {
        Prospect p = new Prospect();
        apply(p, req);
        return new ProspectResponse(prospectRepository.save(p));
    }

    @Transactional
    public ProspectResponse update(Long id, ProspectRequest req) {
        Prospect p = prospectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        apply(p, req);
        return new ProspectResponse(prospectRepository.save(p));
    }

    public void delete(Long id) {
        prospectRepository.deleteById(id);
    }

    private void apply(Prospect p, ProspectRequest req) {
        p.setFullName(req.getFullName());
        p.setFullNameKana(req.getFullNameKana());
        p.setPhone(req.getPhone());
        p.setEmail(req.getEmail());
        p.setGrade(req.getGrade());
        p.setSchoolName(req.getSchoolName());
        if (req.getInquiryDate() != null) p.setInquiryDate(req.getInquiryDate());
        p.setTrialDate(req.getTrialDate());
        if (req.getStatus() != null) p.setStatus(Prospect.Status.valueOf(req.getStatus()));
        p.setInterestCourses(req.getInterestCourses());
        p.setReferralSource(req.getReferralSource());
        p.setMemo(req.getMemo());
        if (req.getAssignedStaffId() != null) {
            p.setAssignedStaff(staffRepository.findById(req.getAssignedStaffId()).orElse(null));
        }
        if (req.getEnrolledStudentId() != null) {
            p.setEnrolledStudent(studentRepository.findById(req.getEnrolledStudentId()).orElse(null));
        }
    }
}
