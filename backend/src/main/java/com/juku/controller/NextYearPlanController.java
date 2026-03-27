package com.juku.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/next-year-plan")
@RequiredArgsConstructor
public class NextYearPlanController {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    @GetMapping("/{year}")
    public Object getPlan(@PathVariable int year) {
        try {
            String json = jdbc.queryForObject(
                "SELECT plan_json FROM next_year_plans WHERE target_year = ?",
                String.class, year);
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return null;
        }
    }

    @PostMapping
    public void savePlan(@RequestBody Map<String, Object> body) {
        try {
            int year = ((Number) body.get("targetYear")).intValue();
            String json = objectMapper.writeValueAsString(body);
            jdbc.update("""
                INSERT INTO next_year_plans (target_year, plan_json, updated_at)
                VALUES (?, ?::jsonb, NOW())
                ON CONFLICT (target_year) DO UPDATE
                SET plan_json = EXCLUDED.plan_json, updated_at = NOW()
                """, year, json);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save plan", e);
        }
    }
}
