package com.juku.dto;

import com.juku.entity.Guardian;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class GuardianResponse {
    private final Long id;
    private final String fullName;
    private final String fullNameKana;
    private final String phone;
    private final String phoneSub;
    private final String email;
    private final String address;
    private final String memo;
    private final LocalDateTime createdAt;

    public GuardianResponse(Guardian g) {
        this.id = g.getId();
        this.fullName = g.getFullName();
        this.fullNameKana = g.getFullNameKana();
        this.phone = g.getPhone();
        this.phoneSub = g.getPhoneSub();
        this.email = g.getEmail();
        this.address = g.getAddress();
        this.memo = g.getMemo();
        this.createdAt = g.getCreatedAt();
    }
}
