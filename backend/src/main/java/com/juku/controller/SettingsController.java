package com.juku.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final JdbcTemplate jdbc;

    @GetMapping
    public ResponseEntity<Map<String, String>> getAll() {
        Map<String, String> settings = new HashMap<>();
        jdbc.query("SELECT key, value FROM system_settings", rs -> {
            settings.put(rs.getString("key"), rs.getString("value"));
        });
        return ResponseEntity.ok(settings);
    }

    @PatchMapping("/{key}")
    public ResponseEntity<Void> update(@PathVariable String key,
                                       @RequestBody Map<String, String> body) {
        String value = body.get("value");
        if (value == null) return ResponseEntity.badRequest().build();
        jdbc.update("""
                INSERT INTO system_settings (key, value, updated_at)
                VALUES (?, ?, NOW())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
                """, key, value);
        return ResponseEntity.ok().build();
    }
}
