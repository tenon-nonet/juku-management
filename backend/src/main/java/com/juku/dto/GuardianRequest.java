package com.juku.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuardianRequest {
    @NotBlank
    private String fullName;
    private String fullNameKana;
    @NotBlank
    private String phone;
    private String phoneSub;
    private String email;
    private String address;
    private String memo;
}
