package com.synergy.bokja.controller;

import com.synergy.bokja.auth.JwtTokenProvider;
import com.synergy.bokja.dto.MedicationCombinationRequestDTO;
import com.synergy.bokja.dto.MedicationCombinationResponseDTO;
import com.synergy.bokja.response.BaseResponse;
import com.synergy.bokja.service.MedicationCombinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me/medications")
@RequiredArgsConstructor
public class MedicationCombinationController {

    private final MedicationCombinationService medicationCombinationService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 복약 알림 시간 조합 조회
     */
    @GetMapping("/{umno}/combination")
    public ResponseEntity<?> getCombination(
            @RequestHeader("Authorization") String token,
            @PathVariable("umno") Long umno) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        MedicationCombinationResponseDTO result =
                medicationCombinationService.getCombination(uno, umno);

        BaseResponse<MedicationCombinationResponseDTO> response =
                new BaseResponse<>(1000, "투약 횟수 조회에 성공하였습니다.", result);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * 복약 알림 시간 조합 수정
     */
    @PutMapping("/{umno}/combination")
    public ResponseEntity<?> updateCombination(
            @RequestHeader("Authorization") String token,
            @PathVariable("umno") Long umno,
            @RequestBody MedicationCombinationRequestDTO request) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        MedicationCombinationResponseDTO result =
                medicationCombinationService.updateCombination(uno, umno, request);

        BaseResponse<MedicationCombinationResponseDTO> response =
                new BaseResponse<>(1000, "투약 횟수 수정에 성공하였습니다.", result);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
