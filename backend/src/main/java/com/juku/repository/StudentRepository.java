package com.juku.repository;

import com.juku.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {

    @Query("SELECT s FROM Student s WHERE " +
           "(:name IS NULL OR s.fullName LIKE %:name% OR s.fullNameKana LIKE %:name%) AND " +
           "(:grade IS NULL OR s.grade = :grade) AND " +
           "(:status IS NULL OR s.status = :status)")
    List<Student> search(
        @Param("name") String name,
        @Param("grade") String grade,
        @Param("status") Student.Status status
    );

    long countByStatus(Student.Status status);

    List<Student> findByGuardianId(Long guardianId);

    List<Student> findByPrimaryTeacherId(Long teacherId);
}
