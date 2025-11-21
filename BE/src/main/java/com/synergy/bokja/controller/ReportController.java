package com.synergy.bokja.controller;

import com.synergy.bokja.auth.JwtTokenProvider;
import com.synergy.bokja.dto.ReportDetailResponseDTO;
import com.synergy.bokja.dto.ReportListResponseDTO;
import com.synergy.bokja.dto.ReportSummaryResponseDTO;
import com.synergy.bokja.response.BaseResponse;
import com.synergy.bokja.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("")
    public ResponseEntity<?> getUserReports(@RequestHeader("Authorization") String token) {
        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // uno 기준 조회
        ReportListResponseDTO result = reportService.getUserReports(uno);

        BaseResponse<ReportListResponseDTO> response =
                new BaseResponse<>(1000, "리포트 목록 조회에 성공하였습니다.", result);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{rno}")
    public ResponseEntity<?> getReportDetail(@RequestHeader("Authorization") String token,
                                             @PathVariable Long rno) {
        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        ReportDetailResponseDTO result = reportService.getReportDetail(rno);
        BaseResponse<ReportDetailResponseDTO> response =
                new BaseResponse<>(1000, "리포트 상세 조회에 성공하였습니다.", result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{rno}/summary")
    public ResponseEntity<?> getReportSummary(@RequestHeader("Authorization") String token,
                                              @PathVariable Long rno) {
        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        ReportSummaryResponseDTO result = reportService.getReportSummary(rno);
        BaseResponse<ReportSummaryResponseDTO> response =
                new BaseResponse<>(1000, "리포트 요약 조회에 성공하였습니다.", result);
        return ResponseEntity.ok(response);
    }
}