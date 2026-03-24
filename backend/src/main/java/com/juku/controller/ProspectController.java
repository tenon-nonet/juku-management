package com.juku.controller;

import com.juku.dto.ProspectRequest;
import com.juku.dto.ProspectResponse;
import com.juku.service.ProspectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prospects")
@RequiredArgsConstructor
public class ProspectController {

    private final ProspectService prospectService;

    @GetMapping
    public List<ProspectResponse> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String name) {
        return prospectService.search(status, name);
    }

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        return prospectService.getStatusCounts();
    }

    @GetMapping("/{id}")
    public ProspectResponse get(@PathVariable Long id) {
        return prospectService.findById(id);
    }

    @PostMapping
    public ProspectResponse create(@RequestBody ProspectRequest req) {
        return prospectService.create(req);
    }

    @PutMapping("/{id}")
    public ProspectResponse update(@PathVariable Long id, @RequestBody ProspectRequest req) {
        return prospectService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        prospectService.delete(id);
    }
}
