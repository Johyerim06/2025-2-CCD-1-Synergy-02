package com.synergy.bokja.controller;

import com.synergy.bokja.auth.JwtTokenProvider;
import com.synergy.bokja.dto.*;
import com.synergy.bokja.response.BaseResponse;
import com.synergy.bokja.service.MedicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 이미지 기반 복약 등록 (처방전 / 약봉투)
     * POST /medications
     * - mode: "1" (처방전), "2" (약봉투)
     * - image: MultipartFile
     */
    @PostMapping("/medications")
    public ResponseEntity<?> uploadMedication(
            @RequestHeader("Authorization") String token,
            @RequestParam String mode,
            @RequestParam("image") MultipartFile imageFile
    ) {

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

    /**
     * 복약 카테고리 수정
     * PATCH /users/me/medications/{umno}
     */
    @PatchMapping("/users/me/medications/{umno}")
    public ResponseEntity<?> updateMedicationCategory(
            @RequestHeader("Authorization") String token,
            @PathVariable("umno") Long umno,
            @RequestBody MedicationCategoryUpdateRequestDTO request
    ) {

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

    /**
     * 복약 상세 조회
     * GET /users/me/medications/{umno}
     */
    @GetMapping("/users/me/medications/{umno}")
    public ResponseEntity<?> getMedicationDetail(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("umno") Long umno
    ) {
        final String token = authorization.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
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

    /**
     * 복약 요약 조회
     * GET /users/me/medications/{umno}/summary
     */
    @GetMapping("/users/me/medications/{umno}/summary")
    public ResponseEntity<?> getMedicationSummary(
            @RequestHeader("Authorization") String token,
            @PathVariable Long umno
    ) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        MedicationSummaryResponseDTO result =
                medicationService.getMedicationSummary(uno, umno);

        BaseResponse<MedicationSummaryResponseDTO> response =
                new BaseResponse<>(1000, "복약 정보 조회에 성공하였습니다.", result);

        return ResponseEntity.ok(response);
    }

    /**
     * 복약 알림 시간 조합 조회
     * GET /users/me/medications/{umno}/combination
     */
    @GetMapping("/users/me/medications/{umno}/combination")
    public ResponseEntity<?> getCombination(
            @RequestHeader("Authorization") String token,
            @PathVariable("umno") Long umno
    ) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        MedicationCombinationResponseDTO result =
                medicationService.getCombination(uno, umno);

        BaseResponse<MedicationCombinationResponseDTO> response =
                new BaseResponse<>(1000, "투약 횟수 조회에 성공하였습니다.", result);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * 복약 알림 시간 조합 수정
     * PUT /users/me/medications/{umno}/combination
     */
    @PutMapping("/users/me/medications/{umno}/combination")
    public ResponseEntity<?> updateCombination(
            @RequestHeader("Authorization") String token,
            @PathVariable("umno") Long umno,
            @RequestBody MedicationCombinationRequestDTO request
    ) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        MedicationCombinationResponseDTO result =
                medicationService.updateCombination(uno, umno, request);

        BaseResponse<MedicationCombinationResponseDTO> response =
                new BaseResponse<>(1000, "투약 횟수 수정에 성공하였습니다.", result);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * 개별 복약 시간 조회
     * GET /users/me/medications/{umno}/times?type=breakfast|lunch|dinner|night
     */
    @GetMapping("/users/me/medications/{umno}/times")
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

        MedicationTimeItemDTO result = medicationService.getMedicationTime(uno, umno, type);

        BaseResponse<MedicationTimeItemDTO> response =
                new BaseResponse<>(1000, "개별 복약 시간 조회에 성공하였습니다.", result);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * 개별 복약 시간 수정
     * PATCH /users/me/medications/{umno}/times/{atno}
     */
    @PatchMapping("/users/me/medications/{umno}/times/{atno}")
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
                medicationService.updateMedicationTime(uno, umno, atno, request);

        BaseResponse<MedicationTimeUpdateResponseDTO> response =
                new BaseResponse<>(1000, "개별 복약 시간 수정에 성공하였습니다.", result);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
