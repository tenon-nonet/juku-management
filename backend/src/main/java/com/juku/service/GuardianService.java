package com.juku.service;

import com.juku.dto.GuardianRequest;
import com.juku.dto.GuardianResponse;
import com.juku.entity.Guardian;
import com.juku.repository.GuardianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GuardianService {

    private final GuardianRepository guardianRepository;

    public List<GuardianResponse> findAll(String name) {
        if (name != null && !name.isBlank()) {
            return guardianRepository.findByFullNameContainingIgnoreCase(name)
                .stream().map(GuardianResponse::new).toList();
        }
        return guardianRepository.findAll().stream().map(GuardianResponse::new).toList();
    }

    public GuardianResponse findById(Long id) {
        return guardianRepository.findById(id)
            .map(GuardianResponse::new)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public GuardianResponse create(GuardianRequest req) {
        Guardian g = new Guardian();
        applyRequest(g, req);
        return new GuardianResponse(guardianRepository.save(g));
    }

    public GuardianResponse update(Long id, GuardianRequest req) {
        Guardian g = guardianRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        applyRequest(g, req);
        return new GuardianResponse(guardianRepository.save(g));
    }

    public void delete(Long id) {
        if (!guardianRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        guardianRepository.deleteById(id);
    }

    private void applyRequest(Guardian g, GuardianRequest req) {
        g.setFullName(req.getFullName());
        g.setFullNameKana(req.getFullNameKana());
        g.setPhone(req.getPhone());
        g.setPhoneSub(req.getPhoneSub());
        g.setEmail(req.getEmail());
        g.setAddress(req.getAddress());
        g.setMemo(req.getMemo());
    }
}
