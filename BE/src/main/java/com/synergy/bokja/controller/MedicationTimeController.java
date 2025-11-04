package com.synergy.bokja.controller;

import com.synergy.bokja.auth.JwtTokenProvider;
import com.synergy.bokja.dto.MedicationTimeItemDTO;
import com.synergy.bokja.dto.MedicationTimeUpdateRequestDTO;
import com.synergy.bokja.dto.MedicationTimeUpdateResponseDTO;
import com.synergy.bokja.response.BaseResponse;
import com.synergy.bokja.service.MedicationTimeQueryService;
import com.synergy.bokja.service.MedicationTimeUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me/medications")
@RequiredArgsConstructor
public class MedicationTimeController {

    private final MedicationTimeQueryService medicationTimeQueryService;
    private final MedicationTimeUpdateService medicationTimeUpdateService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/{umno}/times")
    public ResponseEntity<?> getMedicationTime(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("umno") Long umno,
            @RequestParam("type") String type
    ) {

        final String token = authorization.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("FORBIDDEN");
        }
        Long uno = (auth.getPrincipal() instanceof Long)
                ? (Long) auth.getPrincipal()
                : Long.parseLong(auth.getName());

        MedicationTimeItemDTO result = medicationTimeQueryService.getMedicationTime(uno, umno, type);

        BaseResponse<MedicationTimeItemDTO> response =
                new BaseResponse<>(1000, "개별 복약 시간 조회에 성공하였습니다.", result);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PatchMapping("/{umno}/times/{atno}")
    public ResponseEntity<?> updateMedicationTime(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("umno") Long umno,
            @PathVariable("atno") Long atno,
            @RequestBody MedicationTimeUpdateRequestDTO request
    ) {

        final String token = authorization.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("FORBIDDEN");
        }
        Long uno = (auth.getPrincipal() instanceof Long)
                ? (Long) auth.getPrincipal()
                : Long.parseLong(auth.getName());

        MedicationTimeUpdateResponseDTO result =
                medicationTimeUpdateService.updateMedicationTime(uno, umno, atno, request);

        BaseResponse<MedicationTimeUpdateResponseDTO> response =
                new BaseResponse<>(1000, "개별 복약 시간 수정에 성공하였습니다.", result);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
