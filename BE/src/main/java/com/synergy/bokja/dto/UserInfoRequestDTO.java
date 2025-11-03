package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class UserInfoRequestDTO {
    private Long uno;
    private String name;
    private LocalDate birth;
    private String phone;
}
