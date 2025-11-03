package com.synergy.bokja.controller;

import com.synergy.bokja.auth.JwtTokenProvider;
import com.synergy.bokja.dto.MedicationTimePresetResponseDTO;
import com.synergy.bokja.dto.SideEffectPresetResponseDTO;
import com.synergy.bokja.service.PresetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.synergy.bokja.response.BaseResponse;

@RestController
@RequiredArgsConstructor
public class PresetController {

    private final PresetService presetService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/medication-time-presets")
    public ResponseEntity<?> getMedicationTimePreset(@RequestHeader("Authorization") String token,
                                             @RequestParam String type) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        MedicationTimePresetResponseDTO result = presetService.getTimeList(type);
        BaseResponse<MedicationTimePresetResponseDTO> response =
                new BaseResponse<>(1000, "복약 설정 시간 조회 성공", result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/side-effects-presets")
    public ResponseEntity<?> getSideEffectPreset(@RequestHeader("Authorization") String token) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        SideEffectPresetResponseDTO result = presetService.getEffectList();
        BaseResponse<SideEffectPresetResponseDTO> response =
                new BaseResponse<>(1000, "부작용 리스트 조회 성공", result);
        return ResponseEntity.ok(response);
    }

}
