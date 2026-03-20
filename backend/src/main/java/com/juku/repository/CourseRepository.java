package com.juku.repository;

import com.juku.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByIsActiveTrueOrderByNameAsc();
    List<Course> findAllByOrderByNameAsc();
}
