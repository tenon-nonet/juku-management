package com.juku.service;

import com.juku.dto.AnnouncementRequest;
import com.juku.dto.AnnouncementResponse;
import com.juku.entity.Announcement;
import com.juku.repository.AnnouncementRepository;
import com.juku.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final StaffRepository staffRepository;

    public List<AnnouncementResponse> findAll() {
        return announcementRepository.findAllByOrderByCreatedAtDesc()
            .stream().map(AnnouncementResponse::new).toList();
    }

    public AnnouncementResponse findById(Long id) {
        return announcementRepository.findById(id)
            .map(AnnouncementResponse::new)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public AnnouncementResponse create(AnnouncementRequest req, String staffUsername) {
        Announcement a = new Announcement();
        applyRequest(a, req);
        staffRepository.findByUsername(staffUsername).ifPresent(a::setCreatedBy);
        return new AnnouncementResponse(announcementRepository.save(a));
    }

    public AnnouncementResponse update(Long id, AnnouncementRequest req) {
        Announcement a = announcementRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        applyRequest(a, req);
        return new AnnouncementResponse(announcementRepository.save(a));
    }

    public void delete(Long id) {
        if (!announcementRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        announcementRepository.deleteById(id);
    }

    private void applyRequest(Announcement a, AnnouncementRequest req) {
        a.setTitle(req.getTitle());
        a.setContent(req.getContent());
        a.setTarget(req.getTarget());
        a.setTargetValue(req.getTargetValue());
        a.setExpiresAt(req.getExpiresAt());
        boolean wasPublished = a.isPublished();
        a.setPublished(req.isPublished());
        if (!wasPublished && req.isPublished()) {
            a.setPublishedAt(LocalDateTime.now());
        }
    }
}
