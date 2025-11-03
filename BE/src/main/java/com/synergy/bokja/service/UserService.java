package com.synergy.bokja.service;

import com.synergy.bokja.dto.UserInfoResponseDTO;
import com.synergy.bokja.dto.UserSignupRequestDTO;
import com.synergy.bokja.entity.UserEntity;
import com.synergy.bokja.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Long signup(UserSignupRequestDTO request) {

        UserEntity user = UserEntity.builder()
                .name(request.getName())
                .birth(request.getBirth())
                .phone(request.getPhone())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .fcmToken(request.getFcmToken())
                .build();

        user = userRepository.save(user);
        Long uno = user.getUno();

        return uno;
    }

    public boolean isDuplicate(UserSignupRequestDTO request) {
        UserEntity user = userRepository.findByNameAndBirthAndPhone(request.getName(), request.getBirth(), request.getPhone());

        return user != null;
    }

    public UserInfoResponseDTO getUserInfo(Long uno) {

        UserEntity info = userRepository.findByUno(uno);

        return new UserInfoResponseDTO(
                info.getUno(),
                info.getName(),
                info.getBirth(),
                info.getPhone()
        );
    }
}
