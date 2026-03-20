package com.juku.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubjectRequest {
    @NotBlank
    private String name;
    private String color;
    private int sortOrder;
}
