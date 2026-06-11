package io.mediflow.core.platformbo.marketing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 병원별 마케팅 지표 엔티티.
 * hospital_marketing_stats 테이블에 저장된다.
 * AEO·SEO·LINE 팔로워는 외부 서비스가 업데이트하며,
 * 서비스 미연결 시에는 이 테이블의 값을 직접 관리한다.
 */
@Entity
@Table(name = "hospital_marketing_stats")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class HospitalMarketingStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 병원 ID (플랫폼 DB 기준). 병원당 1행 */
    @Column(name = "hospital_id", nullable = false, unique = true)
    private Long hospitalId;

    /** 병원명 (표시용 캐시 — 조인 없이 반환) */
    @Column(name = "hospital_name", nullable = false, length = 100)
    private String hospitalName;

    /** AEO 점수 (Answer Engine Optimization, 0~100) */
    @Column(name = "aeo_score", nullable = false)
    @Builder.Default
    private int aeoScore = 0;

    /** SEO 점수 (0~100) */
    @Column(name = "seo_score", nullable = false)
    @Builder.Default
    private int seoScore = 0;

    /** LINE 팔로워 수 */
    @Column(name = "line_followers", nullable = false)
    @Builder.Default
    private int lineFollowers = 0;

    /** 전주 대비 AEO 변화량 (양수=상승, 음수=하락) */
    @Column(name = "aeo_weekly_change", nullable = false)
    @Builder.Default
    private int aeoWeeklyChange = 0;

    /** 최종 수정 시각 — 저장·수정 시 자동 갱신 */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    private void onSave() {
        this.updatedAt = LocalDateTime.now();
    }
}
