package com.synergy.bokja.controller;

import com.synergy.bokja.auth.JwtTokenProvider;
import com.synergy.bokja.dto.MedicationCreateRequestDTO;
import com.synergy.bokja.dto.MedicationCreateResponseDTO;
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
@RequestMapping("/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping
    public ResponseEntity<?> createMedication(
            @RequestHeader("Authorization") String authorization,
            @RequestBody @Valid MedicationCreateRequestDTO request
    ) {
        // 1) 토큰 원복 및 유효성 재확인(기존 컨트롤러들과 동일 패턴)
        final String token = authorization.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(token)) {
            // ReportController 컨벤션: 403 + 문자열
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("FORBIDDEN");
        }

        // 2) SecurityContext에서 uno 추출(프로젝트 컨벤션)
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

        // 3) 서비스 위임
        final Long umno = medicationService.createFromImage(uno, request.getImg());

        // 4) BaseResponse는 생성자로 반환(성공 코드 1000 컨벤션)
        BaseResponse<MedicationCreateResponseDTO> body =
                new BaseResponse<>(1000, "이미지 업로드에 성공하였습니다.",
                        new MedicationCreateResponseDTO(umno));

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
}
