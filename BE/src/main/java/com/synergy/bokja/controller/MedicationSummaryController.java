package com.synergy.bokja.controller;

import com.synergy.bokja.auth.JwtTokenProvider;
import com.synergy.bokja.dto.MedicationSummaryResponseDTO;
import com.synergy.bokja.response.BaseResponse;
import com.synergy.bokja.service.MedicationSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me/medications")
@RequiredArgsConstructor
public class MedicationSummaryController {

    private final MedicationSummaryService medicationSummaryService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/{umno}/summary")
    public ResponseEntity<?> getMedicationSummary(
            @RequestHeader("Authorization") String token,
            @PathVariable Long umno) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        MedicationSummaryResponseDTO result =
                medicationSummaryService.getMedicationSummary(uno, umno);

        BaseResponse<MedicationSummaryResponseDTO> response =
                new BaseResponse<>(1000, "복약 정보 조회에 성공하였습니다.", result);

        return ResponseEntity.ok(response);
    }
}
