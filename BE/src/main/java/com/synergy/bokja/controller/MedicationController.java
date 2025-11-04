package com.synergy.bokja.controller;

import com.synergy.bokja.auth.JwtTokenProvider;
import com.synergy.bokja.dto.*;
import com.synergy.bokja.response.BaseResponse;
import com.synergy.bokja.service.MedicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping
    public ResponseEntity<?> createMedication(
            @RequestHeader("Authorization") String authorization,
            @RequestBody @Valid MedicationCreateRequestDTO request
    ) {
        final String token = authorization.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(token)) {
            // ReportController 컨벤션: 403 + 문자열
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("FORBIDDEN");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("FORBIDDEN");
        }
        Long uno;
        try {
            Object p = auth.getPrincipal();
            if (p instanceof Long) {
                uno = (Long) p;
            } else if (p instanceof String) {
                uno = Long.parseLong((String) p);
            } else {
                // CustomUserDetails 등을 쓰는 경우 getName()을 uno 문자열로 사용하는 컨벤션
                uno = Long.parseLong(auth.getName());
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("FORBIDDEN");
        }

        final Long umno = medicationService.createFromImage(uno, request.getImg());

        BaseResponse<MedicationCreateResponseDTO> body =
                new BaseResponse<>(1000, "이미지 업로드에 성공하였습니다.",
                        new MedicationCreateResponseDTO(umno));

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PatchMapping("/{umno}")
    public ResponseEntity<?> updateMedicationCategory(
            @RequestHeader("Authorization") String token,
            @PathVariable("umno") Long umno,
            @RequestBody MedicationCategoryUpdateRequestDTO request) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        MedicationCategoryUpdateResponseDTO result =
                medicationService.updateMedicationCategory(uno, umno, request);

        BaseResponse<MedicationCategoryUpdateResponseDTO> response =
                new BaseResponse<>(1000, "복약 카테고리 수정에 성공하였습니다.", result);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/{umno}")
    public ResponseEntity<?> getMedicationDetail(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("umno") Long umno
    ) {
        final String token = authorization.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("FORBIDDEN");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("FORBIDDEN");
        }

        Long uno;
        try {
            Object p = auth.getPrincipal();
            if (p instanceof Long) uno = (Long) p;
            else if (p instanceof String) uno = Long.parseLong((String) p);
            else uno = Long.parseLong(auth.getName());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("FORBIDDEN");
        }

        MedicationDetailResponseDTO result = medicationService.getMedicationDetail(uno, umno);

        BaseResponse<MedicationDetailResponseDTO> response =
                new BaseResponse<>(1000, "상세 복약 정보 조회에 성공하였습니다.", result);

        return ResponseEntity.ok(response);
    }
}
