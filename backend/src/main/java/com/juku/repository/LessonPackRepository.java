package com.juku.repository;

import com.juku.entity.LessonPack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonPackRepository extends JpaRepository<LessonPack, Long> {
    List<LessonPack> findByIsActiveTrueOrderByCreatedAtDesc();
    List<LessonPack> findAllByOrderByCreatedAtDesc();
}
