package io.mediflow.core.platformbo.marketing.service;

import io.mediflow.core.platformbo.marketing.dto.HospitalMarketingStatsDto;
import io.mediflow.core.platformbo.marketing.repository.HospitalMarketingStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 본사용 BO — 마케팅 지표 서비스.
 * AEO 점수 내림차순으로 전체 병원의 지표를 반환한다.
 * 플랫폼 레벨이므로 TenantContext 사용 금지.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlatformMarketingService {

    private final HospitalMarketingStatsRepository marketingStatsRepository;

    /**
     * 전체 병원의 마케팅 지표를 AEO 점수 내림차순으로 반환한다.
     */
    @Transactional(readOnly = true)
    public List<HospitalMarketingStatsDto> getAllStats() {
        return marketingStatsRepository.findAllByOrderByAeoScoreDesc()
                .stream()
                .map(HospitalMarketingStatsDto::from)
                .toList();
    }
}
