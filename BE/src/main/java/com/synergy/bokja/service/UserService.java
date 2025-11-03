package com.synergy.bokja.service;

import com.synergy.bokja.dto.*;
import com.synergy.bokja.entity.*;
import com.synergy.bokja.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TimeRepository timeRepository;
    private final UserTimeRepository userTimeRepository;
    private final UserMedicineRepository userMedicineRepository;
    private final CycleRepository cycleRepository;

    @Transactional
    public Long signup(UserSignupRequestDTO request) {

        UserEntity user = UserEntity.builder()
                .name(request.getName())
                .birth(request.getBirth())
                .phone(request.getPhone())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .fcmToken(request.getFcmToken())
                .build();

        user = userRepository.save(user);
        Long uno = user.getUno();

        return uno;
    }

    public boolean isDuplicate(UserSignupRequestDTO request) {
        UserEntity user = userRepository.findByNameAndBirthAndPhone(request.getName(), request.getBirth(), request.getPhone());

        return user != null;
    }

    public UserInfoResponseDTO getUserInfo(Long uno) {

        UserEntity info = userRepository.findByUno(uno);

        return new UserInfoResponseDTO(
                info.getUno(),
                info.getName(),
                info.getBirth(),
                info.getPhone()
        );
    }

    @Transactional
    public UserMedicationTimeResponseDTO setUserMedicineTime(Long uno, UserMedicationTimeRequestDTO request){
        Long tno = request.getTno();

        UserEntity user = userRepository.findByUno(uno);
        if (user == null) {
            throw new IllegalArgumentException("유효하지 않은 uno: " + uno);
        }

        TimeEntity time = timeRepository.findById(tno)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 tno: " + tno));

        UserTimeEntity newUserTime = UserTimeEntity.builder()
                .user(user)
                .time(time)
                .createdAt(LocalDateTime.now())
                .build();

        UserTimeEntity savedEntity = userTimeRepository.save(newUserTime);

        return new UserMedicationTimeResponseDTO(
                savedEntity.getUtno(),
                savedEntity.getUser().getUno(),
                savedEntity.getTime().getTno()
        );

    }

    @Transactional
    public UserInfoResponseDTO updateUserInfo(Long uno, UserInfoRequestDTO request) {
        UserEntity user = userRepository.findByUno(uno);
        if (user == null) {
            throw new IllegalArgumentException("유효하지 않은 uno: " + uno);
        }

        if (StringUtils.hasText(request.getName())) {
            user.setName(request.getName());
        }

        if (request.getBirth() != null) {
            user.setBirth(request.getBirth());
        }

        if (StringUtils.hasText(request.getPhone())) {
            user.setPhone(request.getPhone());
        }

        return new UserInfoResponseDTO(user);
    }

    @Transactional
    public UsersResponseDTO deleteUser(Long uno) {
        UserEntity user = userRepository.findByUno(uno);
        if (user == null) {
            throw new IllegalArgumentException("유효하지 않은 uno: " + uno);
        }

        user.setIsActive(false);

        return new UsersResponseDTO(user.getUno());
    }

    public getUserMedicationTimeResponseDTO getUserMedicineTime(Long uno, String type) {
        UserEntity user = userRepository.findByUno(uno);
        if (user == null) {
            throw new IllegalArgumentException("유효하지 않은 uno: " + uno);
        }

        UserTimeEntity userTime = userTimeRepository.findByUser_UnoAndTime_Type(uno, type)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자의 '" + type + "' 시간 설정을 찾을 수 없습니다."));

        TimeEntity timeEntity = userTime.getTime();

        return new getUserMedicationTimeResponseDTO(
                user.getUno(),
                userTime.getUtno(),
                timeEntity.getTno(),
                timeEntity.getType(),
                timeEntity.getTime().getHour()
        );

    }

    @Transactional
    public getUserMedicationTimeResponseDTO updateUserMedicineTime(Long uno, updateUserMedicationTimeRequestDTO request) {
        UserEntity user = userRepository.findByUno(uno);
        if (user == null) {
            throw new IllegalArgumentException("유효하지 않은 uno: " + uno);
        }

        String typeToUpdate = request.getType();
        int newHour = request.getTime();
        LocalTime newLocalTime = LocalTime.of(newHour, 0);

        TimeEntity newTimeEntity = timeRepository.findByTypeAndTime(typeToUpdate, newLocalTime)
                .orElseThrow(() -> new IllegalArgumentException("'" + typeToUpdate + "' 타입의 " + newHour + "시 설정이 time_table에 없습니다."));

        UserTimeEntity userTime = userTimeRepository.findByUser_UnoAndTime_Type(uno, typeToUpdate)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저의 '" + typeToUpdate + "' 타입 설정을 찾을 수 없습니다."));

        userTime.setTime(newTimeEntity);
        userTime.setUpdatedAt(LocalDateTime.now());

        return new getUserMedicationTimeResponseDTO(
                user.getUno(),
                userTime.getUtno(),
                newTimeEntity.getTno(),
                newTimeEntity.getType(),
                newTimeEntity.getTime().getHour()
        );
    }

    public UserTodayMedicationResponseDTO getUserTodayMedications(Long uno){
        UserEntity user = userRepository.findByUno(uno);
        if (user == null) {
            throw new IllegalArgumentException("유효하지 않은 uno: " + uno);
        }

        LocalDate today = LocalDate.now();

        List<UserMedicineEntity> allUserMedicines = userMedicineRepository.findAllByUser_Uno(uno);

        List<Long> umnoList = allUserMedicines.stream()
                .map(UserMedicineEntity::getUmno)
                .collect(Collectors.toList());

        Map<Long, CycleEntity> cycleMap = cycleRepository.findAllByUserMedicine_UmnoIn(umnoList).stream()
                .collect(Collectors.toMap(
                        cycle -> cycle.getUserMedicine().getUmno(), // Key: umno
                        cycle -> cycle                            // Value: CycleEntity
                ));

        List<UserTodayMedicationDTO> todayMedications = allUserMedicines.stream()
                .filter(med -> {
                    CycleEntity cycle = cycleMap.get(med.getUmno());
                    if (cycle == null) return false;

                    LocalDate start = cycle.getStartDate();
                    LocalDate end = cycle.getEndDate();

                    // today.isBefore(start) -> (오늘 < 시작일) -> X
                    // today.isAfter(end) -> (오늘 > 종료일) -> X
                    return !today.isBefore(start) && !today.isAfter(end);
                })

                .map(med -> new UserTodayMedicationDTO(
                        med.getUmno(),
                        med.getHospital(),
                        med.getCategory(),
                        med.getTaken(),
                        cycleMap.get(med.getUmno()).getStartDate()
                ))
                .collect(Collectors.toList());

        return new UserTodayMedicationResponseDTO(todayMedications);
    }
}
