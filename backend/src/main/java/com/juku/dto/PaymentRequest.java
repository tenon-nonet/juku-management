package com.juku.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PaymentRequest {
    @NotNull
    private int paidAmount;
    @NotNull
    private LocalDate paidAt;
    private String method = "BANK_TRANSFER";
    private String note;
}
