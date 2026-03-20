package com.juku.dto;

import com.juku.entity.Invoice;
import com.juku.entity.InvoiceItem;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
public class InvoiceResponse {
    private final Long id;
    private final Long studentId;
    private final String studentName;
    private final String billingMonth;
    private final int totalAmount;
    private final LocalDate dueDate;
    private final String status;
    private final String note;
    private final LocalDateTime issuedAt;
    private final List<ItemDto> items;

    public InvoiceResponse(Invoice inv) {
        this.id = inv.getId();
        this.studentId = inv.getStudent().getId();
        this.studentName = inv.getStudent().getFullName();
        this.billingMonth = inv.getBillingMonth();
        this.totalAmount = inv.getTotalAmount();
        this.dueDate = inv.getDueDate();
        this.status = inv.getStatus().name();
        this.note = inv.getNote();
        this.issuedAt = inv.getIssuedAt();
        this.items = inv.getItems().stream().map(ItemDto::new).toList();
    }

    @Getter
    public static class ItemDto {
        private final Long id;
        private final String description;
        private final int amount;
        private final int sortOrder;

        public ItemDto(InvoiceItem item) {
            this.id = item.getId();
            this.description = item.getDescription();
            this.amount = item.getAmount();
            this.sortOrder = item.getSortOrder();
        }
    }
}
