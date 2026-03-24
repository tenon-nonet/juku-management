package com.juku.repository;

import com.juku.entity.Prospect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProspectRepository extends JpaRepository<Prospect, Long> {

    @Query("SELECT p FROM Prospect p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:name IS NULL OR p.fullName LIKE %:name%) " +
           "ORDER BY p.inquiryDate DESC")
    List<Prospect> search(@Param("status") Prospect.Status status, @Param("name") String name);

    long countByStatus(Prospect.Status status);
}
