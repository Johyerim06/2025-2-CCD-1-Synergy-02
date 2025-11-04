package com.synergy.bokja.service;

import com.synergy.bokja.dto.*;
import com.synergy.bokja.entity.*;
import com.synergy.bokja.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationSummaryService {

    private final UserMedicineRepository userMedicineRepository;
    private final UserMedicineItemRepository userMedicineItemRepository;
    private final CombinationRepository combinationRepository;

    /**
     * - uno 소유 검증
     * - combination 매칭은 '포함(contains)' 기준으로만 수행
     *   (ingredient 또는 combination.name 이 의약품명에 포함될 때만 해당 material 추가)
     * - description은 user_medicine_item_table.description 그대로 사용
     */
    public MedicationSummaryResponseDTO getMedicationSummary(Long uno, Long umno) {
        UserMedicineEntity um = userMedicineRepository.findByUmno(umno);
        if (um == null) throw new IllegalArgumentException("유효하지 않은 umno: " + umno);
        if (um.getUser() == null || um.getUser().getUno() == null || !um.getUser().getUno().equals(uno)) {
            throw new IllegalArgumentException("해당 복약 정보에 대한 접근 권한이 없습니다.");
        }

        List<UserMedicineItemEntity> items =
                userMedicineItemRepository.findAllByUserMedicine_Umno(umno);

        // 모든 병용주의 조합 미리 로드
        List<CombinationEntity> allCombs = combinationRepository.findAll();

        List<MedicationItemDTO> medicines = items.stream()
                .map(item -> {
                    MedicineEntity med = item.getMedicine();
                    if (med == null) return null;

                    String medNameLower = Optional.ofNullable(med.getName()).orElse("")
                            .toLowerCase(Locale.ROOT);

                    // 포함 매칭(ingredient/name)으로 material 수집 (중복 제거/순서 보존)
                    LinkedHashSet<MaterialDTO> mats = new LinkedHashSet<>();
                    for (CombinationEntity comb : allCombs) {
                        // ingredient 포함 매칭
                        String ing = Optional.ofNullable(comb.getIngredient()).orElse("").trim();
                        if (!ing.isEmpty() && medNameLower.contains(ing.toLowerCase(Locale.ROOT))) {
                            MaterialEntity m = comb.getMaterial();
                            if (m != null) mats.add(MaterialDTO.builder()
                                    .mtno(m.getMtno()).name(m.getName()).build());
                            continue; // 같은 comb에서 name 체크는 스킵
                        }
                        // combination.name 포함 매칭 (있을 때만)
                        String combName = Optional.ofNullable(comb.getName()).orElse("").trim();
                        if (!combName.isEmpty() && medNameLower.contains(combName.toLowerCase(Locale.ROOT))) {
                            MaterialEntity m = comb.getMaterial();
                            if (m != null) mats.add(MaterialDTO.builder()
                                    .mtno(m.getMtno()).name(m.getName()).build());
                        }
                    }

                    return MedicationItemDTO.builder()
                            .mdno(med.getMdno())
                            .name(med.getName())
                            .classification(med.getClassification())
                            .image(med.getImage())
                            .description(item.getDescription()) // DB값 그대로
                            .materials(new ArrayList<>(mats))
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return MedicationSummaryResponseDTO.builder()
                .hospital(um.getHospital())
                .category(um.getCategory())
                .medicines(medicines)
                .build();
    }
}
