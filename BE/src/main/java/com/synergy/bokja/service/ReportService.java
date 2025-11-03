package com.synergy.bokja.service;

import com.synergy.bokja.dto.*;
import com.synergy.bokja.entity.*;
import com.synergy.bokja.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserMedicineRepository userMedicineRepository;
    private final CycleRepository cycleRepository;
    private final UserMedicineItemRepository userMedicineItemRepository;
    private final MedicineRepository medicineRepository;
    private final ConditionRepository conditionRepository;
    private final EffectRepository effectRepository;

    /** uno → umno 조회 */
    public Long findUmno(Long uno) {
        UserMedicineEntity userMedicine = userMedicineRepository.findByUno(uno);
        if (userMedicine == null)
            throw new IllegalArgumentException("사용자의 복약 정보가 존재하지 않습니다.");
        return userMedicine.getUmno();
    }

    /** 날짜 범위 리스트 생성 */
    private List<String> daysBetween(String start, String end) {
        LocalDate s = LocalDate.parse(start);
        LocalDate e = LocalDate.parse(end);
        List<String> days = new ArrayList<>();
        for (LocalDate d = s; !d.isAfter(e); d = d.plusDays(1)) {
            days.add(d.toString());
        }
        return days;
    }

    /** [1] 리포트 목록 조회 */
    public ReportListResponseDTO getUserReports(Long umno) {
        List<ReportEntity> reports = reportRepository.findAllByUmno(umno);

        List<ReportItemDTO> reportList = reports.stream().map(r -> {
            CycleEntity cycle = cycleRepository.findByCyno(r.getCyno());
            UserMedicineEntity med = userMedicineRepository.findByUmno(r.getUmno());
            return new ReportItemDTO(
                    r.getRno(),
                    med.getHospital(),
                    med.getCategory(),
                    cycle.getStart_date().toString(),
                    cycle.getEnd_date().toString()
            );
        }).collect(Collectors.toList());

        return new ReportListResponseDTO(reportList);
    }

    /** [2] 리포트 요약 조회 */
    public ReportSummaryResponseDTO getReportSummary(Long rno) {
        ReportEntity report = reportRepository.findByRno(rno)
                .orElseThrow(() -> new IllegalArgumentException("리포트가 존재하지 않습니다."));

        UserMedicineEntity med = userMedicineRepository.findByUmno(report.getUmno());
        CycleEntity cycle = cycleRepository.findByCyno(report.getCyno());

        String start = cycle.getStart_date().toString();
        String end = cycle.getEnd_date().toString();

        List<ColorDTO> colors = daysBetween(start, end).stream()
                .map(d -> new ColorDTO(d, "g")) // 기본 green
                .collect(Collectors.toList());

        return new ReportSummaryResponseDTO(
                report.getRno(),
                med.getHospital(),
                med.getCategory(),
                med.getTaken(),
                start,
                end,
                colors
        );
    }

    /** [3] 리포트 상세 조회 */
    public ReportDetailResponseDTO getReportDetail(Long rno) {
        ReportEntity report = reportRepository.findByRno(rno)
                .orElseThrow(() -> new IllegalArgumentException("리포트가 존재하지 않습니다."));

        UserMedicineEntity userMedicine = userMedicineRepository.findByUmno(report.getUmno());
        CycleEntity cycle = cycleRepository.findByCyno(report.getCyno());
        List<UserMedicineItemEntity> items = userMedicineItemRepository.findAllByUmno(report.getUmno());

        // 약품 상세 정보
        List<MedicineDTO> medicineList = items.stream().map(i -> {
            MedicineEntity med = medicineRepository.findByMdno(i.getMdno());
            return new MedicineDTO(
                    med.getMdno(),
                    med.getName(),
                    med.getClassification(),
                    med.getImage(),
                    med.getInformation() != null ? med.getInformation() : i.getDescription()
            );
        }).collect(Collectors.toList());

        // 복약 주기 정보
        List<ReportCycleDTO> cycleList = List.of(
                new ReportCycleDTO(
                        cycle.getStart_date().toString(),
                        cycle.getEnd_date().toString(),
                        cycle.getTotal_cycle(),
                        cycle.getCur_cycle(),
                        cycle.getSave_cycle()
                )
        );

        // 부작용 기록 통계 (주차별 집계)
        List<ReportEffectWeekDTO> effects = buildWeeklyEffectStats(
                userMedicine.getUno(),
                cycle.getStart_date(),
                cycle.getEnd_date()
        );

        // 결과 조립
        return new ReportDetailResponseDTO(
                report.getRno(),
                userMedicine.getHospital(),
                userMedicine.getCategory(),
                userMedicine.getTaken(),
                medicineList,
                cycleList,
                effects,
                report.getDescription()
        );
    }

    /** 주차별 부작용 통계 생성 */
    private List<ReportEffectWeekDTO> buildWeeklyEffectStats(Long uno, java.sql.Date startDate, java.sql.Date endDate) {
        List<ReportEffectWeekDTO> result = new ArrayList<>();

        LocalDate start = startDate.toLocalDate();
        LocalDate end = endDate.toLocalDate();

        // 전체 기간의 주 단위 구간 생성
        int weekIndex = 1;
        for (LocalDate wStart = start; !wStart.isAfter(end); wStart = wStart.plusWeeks(1)) {
            LocalDate wEnd = wStart.plusDays(6);
            if (wEnd.isAfter(end)) wEnd = end;

            Timestamp startTs = Timestamp.valueOf(wStart.atStartOfDay());
            Timestamp endTs = Timestamp.valueOf(wEnd.atTime(LocalTime.MAX));

            // 해당 주의 부작용 기록 조회
            List<ConditionEntity> weekConditions = conditionRepository.findAllByUnoAndTimeBetween(uno, startTs, endTs);

            // efno별 count 집계
            Map<Long, Long> counts = weekConditions.stream()
                    .collect(Collectors.groupingBy(ConditionEntity::getEfno, Collectors.counting()));

            // DTO 리스트 변환
            List<ReportEffectItemDTO> weekEffects = counts.entrySet().stream().map(e -> {
                EffectEntity effect = effectRepository.findByEfno(e.getKey());
                return new ReportEffectItemDTO(
                        effect.getEfno(),
                        effect.getName(),
                        e.getValue().intValue()
                );
            }).collect(Collectors.toList());

            result.add(new ReportEffectWeekDTO(weekIndex++, weekEffects));
        }

        return result;
    }
}
