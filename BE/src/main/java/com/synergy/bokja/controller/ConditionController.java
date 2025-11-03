package com.synergy.bokja.controller;

import com.synergy.bokja.auth.JwtTokenProvider;
import com.synergy.bokja.dto.ConditionCreateRequestDTO;
import com.synergy.bokja.dto.ConditionCreateResponseDTO;
import com.synergy.bokja.response.BaseResponse;
import com.synergy.bokja.service.ConditionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me/side-effects")
@RequiredArgsConstructor
public class ConditionController {

    private final ConditionService conditionService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("")
    public ResponseEntity<?> createCondition(
            @RequestHeader("Authorization") String token,
            @RequestBody ConditionCreateRequestDTO request) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        ConditionCreateResponseDTO result = conditionService.createCondition(uno, request);

        BaseResponse<ConditionCreateResponseDTO> response =
                new BaseResponse<>(1000, "부작용 리스트 전송에 성공하였습니다.", result);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
