package com.juku.repository;

import com.juku.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceIdOrderByPaidAtDesc(Long invoiceId);

    @Query("SELECT COALESCE(SUM(p.paidAmount), 0) FROM Payment p WHERE p.invoice.id = :invoiceId")
    int sumPaidAmountByInvoiceId(@Param("invoiceId") Long invoiceId);
}
