package io.mediflow.core.platformbo.marketing.dto;

import io.mediflow.core.platformbo.marketing.entity.HospitalMarketingStats;

/**
 * 병원 마케팅 지표 응답 DTO.
 * 엔티티를 직접 노출하지 않고 필요한 필드만 반환한다.
 */
public record HospitalMarketingStatsDto(
        Long   hospitalId,
        String hospitalName,
        int    aeoScore,
        int    seoScore,
        int    lineFollowers,
        int    aeoWeeklyChange
) {
    /** 엔티티 → DTO 변환 팩토리 메서드 */
    public static HospitalMarketingStatsDto from(HospitalMarketingStats entity) {
        return new HospitalMarketingStatsDto(
                entity.getHospitalId(),
                entity.getHospitalName(),
                entity.getAeoScore(),
                entity.getSeoScore(),
                entity.getLineFollowers(),
                entity.getAeoWeeklyChange()
        );
    }
}
