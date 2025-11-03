package com.synergy.bokja.dto;

import com.synergy.bokja.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class UserInfoResponseDTO {

    private Long uno;
    private String name;
    private LocalDate birth;
    private String phone;

    public UserInfoResponseDTO(UserEntity user) {
        this.uno = user.getUno();
        this.name = user.getName();
        this.birth = user.getBirth();
        this.phone = user.getPhone();
    }

}
