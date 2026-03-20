package com.juku.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class InvoiceRequest {
    @NotNull
    private Long studentId;
    @NotBlank
    private String billingMonth;
    @NotNull
    private LocalDate dueDate;
    private String note;
    private List<InvoiceItemRequest> items;

    @Getter
    @Setter
    public static class InvoiceItemRequest {
        private String description;
        private int amount;
        private int sortOrder;
    }
}
