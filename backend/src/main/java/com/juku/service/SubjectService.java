package com.juku.service;

import com.juku.dto.SubjectRequest;
import com.juku.entity.Subject;
import com.juku.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<Subject> findAll() {
        return subjectRepository.findAllByOrderBySortOrderAsc();
    }

    public Subject create(SubjectRequest req) {
        Subject s = new Subject();
        s.setName(req.getName());
        if (req.getColor() != null) s.setColor(req.getColor());
        s.setSortOrder(req.getSortOrder());
        return subjectRepository.save(s);
    }

    public Subject update(Long id, SubjectRequest req) {
        Subject s = subjectRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        s.setName(req.getName());
        if (req.getColor() != null) s.setColor(req.getColor());
        s.setSortOrder(req.getSortOrder());
        return subjectRepository.save(s);
    }

    public void delete(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        subjectRepository.deleteById(id);
    }
}
