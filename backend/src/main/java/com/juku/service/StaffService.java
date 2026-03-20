package com.juku.service;

import com.juku.dto.StaffRequest;
import com.juku.dto.StaffResponse;
import com.juku.entity.Staff;
import com.juku.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    public List<StaffResponse> findAll() {
        return staffRepository.findAll().stream().map(StaffResponse::new).toList();
    }

    public StaffResponse findById(Long id) {
        return staffRepository.findById(id)
            .map(StaffResponse::new)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public StaffResponse create(StaffRequest req) {
        if (staffRepository.existsByUsername(req.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        Staff staff = new Staff();
        staff.setUsername(req.getUsername());
        staff.setPassword(passwordEncoder.encode(req.getPassword()));
        staff.setFullName(req.getFullName());
        if (req.getRole() != null) {
            staff.setRole(Staff.Role.valueOf(req.getRole()));
        }
        staff.setActive(req.isActive());
        return new StaffResponse(staffRepository.save(staff));
    }

    public StaffResponse update(Long id, StaffRequest req) {
        Staff staff = staffRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        staff.setFullName(req.getFullName());
        if (req.getRole() != null) {
            staff.setRole(Staff.Role.valueOf(req.getRole()));
        }
        staff.setActive(req.isActive());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            staff.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        return new StaffResponse(staffRepository.save(staff));
    }

    public void delete(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        staffRepository.deleteById(id);
    }
}
