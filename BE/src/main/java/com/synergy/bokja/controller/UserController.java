package com.synergy.bokja.controller;

import com.synergy.bokja.auth.JwtTokenProvider;
import com.synergy.bokja.dto.*;
import com.synergy.bokja.service.UserService;
import lombok.RequiredArgsConstructor;
import com.synergy.bokja.response.BaseResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("")
    public ResponseEntity<?> signup(@RequestBody UserSignupRequestDTO request) {

        if (userService.isDuplicate(request)) {
            return ResponseEntity.status(409).body(new BaseResponse<>(2001, "이미 가입한 사용자 입니다.", null));
        }

        Long uno = userService.signup(request);
        String token = jwtTokenProvider.createToken(uno);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", token);

        UsersResponseDTO responseBody = new UsersResponseDTO(uno);

        BaseResponse<UsersResponseDTO> response =
                new BaseResponse<>(1000, "회원가입 성공", responseBody);

        return ResponseEntity.status(HttpStatus.CREATED)
                .headers(headers)
                .body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String token) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UserInfoResponseDTO result = userService.getUserInfo(uno);
        BaseResponse<UserInfoResponseDTO> response =
                new BaseResponse<>(1000, "회원 정보 조회 성공", result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/medication-times")
    public ResponseEntity<?> setUserTime(@RequestHeader("Authorization") String token,
                                         @RequestBody UserMedicationTimeRequestDTO request) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UserMedicationTimeResponseDTO result = userService.setUserMedicineTime(uno, request);
        BaseResponse<UserMedicationTimeResponseDTO> response =
                new BaseResponse<>(1000, "복약 시간 설정 성공", result);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateUserInfo(@RequestHeader("Authorization") String token,
                                            @RequestBody UserInfoRequestDTO request) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UserInfoResponseDTO result = userService.updateUserInfo(uno, request);
        BaseResponse<UserInfoResponseDTO> response =
                new BaseResponse<>(1000, "회원 정보 수정 성공", result);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String token) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UsersResponseDTO result = userService.deleteUser(uno);
        BaseResponse<UsersResponseDTO> response =
                new BaseResponse<>(1000, "회원 탈퇴 성공", result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/medication-times")
    public ResponseEntity<?> getUserTime(@RequestHeader("Authorization") String token,
                                         @RequestParam String type) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        getUserMedicationTimeResponseDTO result = userService.getUserMedicineTime(uno, type);
        BaseResponse<getUserMedicationTimeResponseDTO> response =
                new BaseResponse<>(1000, "복약 시간 조회 성공", result);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me/medication-times/{utno}")
    public ResponseEntity<?> updateUserTime(@RequestHeader("Authorization") String token,
                                         @RequestBody updateUserMedicationTimeRequestDTO request) {

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        getUserMedicationTimeResponseDTO result = userService.updateUserMedicineTime(uno, request);
        BaseResponse<getUserMedicationTimeResponseDTO> response =
                new BaseResponse<>(1000, "복약 시간 수정 성공", result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/medications")
    public ResponseEntity<?> getUserMedications(@RequestHeader("Authorization") String token){

        String jwtToken = token.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }

        Long uno = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UserTodayMedicationResponseDTO result = userService.getUserTodayMedications(uno);
        BaseResponse<UserTodayMedicationResponseDTO> response =
                new BaseResponse<>(1000, "활성 복약 목록 조회 성공", result);
        return ResponseEntity.ok(response);
    }

}
