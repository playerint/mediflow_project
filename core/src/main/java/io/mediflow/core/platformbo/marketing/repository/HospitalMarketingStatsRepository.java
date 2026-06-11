package io.mediflow.core.platformbo.marketing.repository;

import io.mediflow.core.platformbo.marketing.entity.HospitalMarketingStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 병원 마케팅 지표 JPA 리포지토리.
 */
public interface HospitalMarketingStatsRepository extends JpaRepository<HospitalMarketingStats, Long> {

    /** AEO 점수 내림차순으로 전체 조회 */
    List<HospitalMarketingStats> findAllByOrderByAeoScoreDesc();
}
