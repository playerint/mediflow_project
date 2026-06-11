package io.mediflow.core.hospitalbo.marketing.service;

import io.mediflow.core.common.tenant.TenantContext;
import io.mediflow.core.hospitalbo.marketing.dto.MarketingStatsResponse;
import io.mediflow.core.hospitalbo.marketing.dto.MarketingStatsResponse.ChannelStat;
import io.mediflow.core.hospitalbo.marketing.dto.MarketingStatsResponse.MonthlyTrend;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 마케팅 현황 서비스.
 *
 * 현재는 하드코딩 목업 데이터를 반환한다.
 * 추후 hospitalId 로 hospital_N 스키마의 실제 데이터로 교체 예정.
 *
 * TenantContext.getHospitalId() 를 반드시 호출해
 * 병원 인증(격리) 원칙(CLAUDE.md 4-1)을 지킨다.
 */
@Service
public class MarketingService {

    private Long requireHospitalId() {
        Long id = TenantContext.getHospitalId();
        if (id == null) throw new SecurityException("병원 인증이 필요합니다.");
        return id;
    }

    /**
     * 채널별 유입 통계 조회.
     * TODO: hospitalId 를 이용해 hospital_{id}.consultations 테이블에서 집계.
     */
    public MarketingStatsResponse getMarketingStats() {
        requireHospitalId(); // 테넌트 격리 확인 — 반드시 유지

        List<ChannelStat> channels = List.of(
                new ChannelStat("LINE",      89, 62.7),
                new ChannelStat("Instagram", 31, 21.8),
                new ChannelStat("Google",    22, 15.5)
        );

        List<MonthlyTrend> trend = List.of(
                new MonthlyTrend("2026-04", 38),
                new MonthlyTrend("2026-05", 51),
                new MonthlyTrend("2026-06", 53)
        );

        return new MarketingStatsResponse(142, channels, trend);
    }
}
