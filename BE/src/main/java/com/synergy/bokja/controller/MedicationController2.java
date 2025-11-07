package com.synergy.bokja.controller;

import com.synergy.bokja.auth.JwtTokenProvider;
import com.synergy.bokja.dto.MedicationCreateResponseDTO;
import com.synergy.bokja.dto.getUserMedicationTimeResponseDTO;
import com.synergy.bokja.response.BaseResponse;
import com.synergy.bokja.service.MedicationService;
import com.synergy.bokja.service.MedicationService2;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class MedicationController2 {

    private final MedicationService2 medicationService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/medications")
    public ResponseEntity<?> getUserTime(@RequestHeader("Authorization") String token,
                                         @RequestParam String mode,
                                         @RequestParam("image") MultipartFile imageFile) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        MedicationCreateResponseDTO result = medicationService.uploadImg(uno, mode, imageFile);
        BaseResponse<MedicationCreateResponseDTO> response =
                new BaseResponse<>(1000, "처방전 등록 성공", result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
