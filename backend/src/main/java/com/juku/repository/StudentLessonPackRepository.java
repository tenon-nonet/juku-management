package com.juku.repository;

import com.juku.entity.StudentLessonPack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentLessonPackRepository extends JpaRepository<StudentLessonPack, Long> {
    List<StudentLessonPack> findByStudentIdOrderByPurchasedAtDesc(Long studentId);
    List<StudentLessonPack> findByPackId(Long packId);
}
