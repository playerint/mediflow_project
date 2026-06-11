package io.mediflow.core.platformbo.crm.service;

import io.mediflow.core.hospital.entity.Hospital;
import io.mediflow.core.hospital.repository.HospitalRepository;
import io.mediflow.core.hospitaldb.repository.HospitalDbRepository;
import io.mediflow.core.platformbo.crm.dto.HospitalCrmSummaryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 본사용 BO — CRM 통계 서비스.
 * 모든 병원의 상담 상태 카운트를 집계한다.
 * 플랫폼 레벨이므로 TenantContext 사용 금지.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlatformCrmService {

    private final HospitalRepository hospitalRepository;
    private final HospitalDbRepository hospitalDbRepository;

    /**
     * 전체 병원의 CRM 상담 통계를 반환한다.
     * hospital_N 스키마가 아직 생성되지 않은 신규 병원은 건너뛴다.
     */
    public List<HospitalCrmSummaryDto> getAllStats() {
        List<Hospital> hospitals = hospitalRepository.findAll();
        List<HospitalCrmSummaryDto> result = new ArrayList<>();

        for (Hospital hospital : hospitals) {
            try {
                int newCount     = hospitalDbRepository.countByStatus(hospital.getId(), "new");
                int pendingCount = hospitalDbRepository.countByStatus(hospital.getId(), "pending");
                int repliedCount = hospitalDbRepository.countByStatus(hospital.getId(), "replied");

                result.add(new HospitalCrmSummaryDto(
                        hospital.getId(),
                        hospital.getNameKr(),
                        newCount,
                        pendingCount,
                        repliedCount
                ));
            } catch (Exception e) {
                // 신규 등록 직후 등 hospital_N 스키마가 없는 경우 → 건너뜀
                log.warn("병원 {} ({}) CRM 통계 조회 실패 — 스키마 미생성 가능성: {}",
                        hospital.getId(), hospital.getNameKr(), e.getMessage());
            }
        }

        return result;
    }
}
