package com.juku.repository;

import com.juku.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByStudentIdOrderByBillingMonthDesc(Long studentId);
    Optional<Invoice> findByStudentIdAndBillingMonth(Long studentId, String billingMonth);

    @Query("SELECT i FROM Invoice i WHERE " +
           "(:month IS NULL OR i.billingMonth = :month) AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:studentId IS NULL OR i.student.id = :studentId) " +
           "ORDER BY i.billingMonth DESC, i.student.fullName ASC")
    List<Invoice> search(
        @Param("month") String month,
        @Param("status") Invoice.Status status,
        @Param("studentId") Long studentId
    );

    long countByStatus(Invoice.Status status);

    List<Invoice> findByStatusOrderByDueDateAsc(Invoice.Status status);
}
