package io.mediflow.core.onboarding.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 병원 1개당 1개의 온보딩 레코드.
 * hospital_id 로 병원과 1:1 매핑된다 (플랫폼 DB에 저장).
 */
@Entity
@Table(name = "onboardings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Onboarding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 어느 병원의 온보딩인지 (CLAUDE.md 4-1 hospital_id 격리 원칙) */
    @Column(nullable = false, unique = true)
    private Long hospitalId;

    /** 현재 진행 중인 단계 번호 (1~9) */
    @Column(nullable = false)
    @Builder.Default
    private int currentStep = 1;

    /**
     * 온보딩 전체 상태
     * - IN_PROGRESS : 진행 중
     * - COMPLETED   : 완료 (환자용 사이트 생성됨)
     * - PAUSED      : 일시 중단
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "IN_PROGRESS";

    /** 각 단계별 완료 시각 (JSON 문자열로 직렬화 — 추후 JSONB 컬럼으로 교체 가능) */
    @Column(columnDefinition = "TEXT")
    private String stepCompletedAtJson;

    /** 온보딩 완료 후 생성된 환자용 사이트 URL */
    @Column(length = 200)
    private String publishedSiteUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    private void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── 도메인 메서드 ──────────────────────────────

    /** 다음 단계로 진행 */
    public void advanceStep() {
        if (this.currentStep < OnboardingStep.TOTAL_STEPS) {
            this.currentStep++;
        }
    }

    /** 온보딩 완료 처리 */
    public void complete(String siteUrl) {
        this.status           = "COMPLETED";
        this.currentStep      = OnboardingStep.TOTAL_STEPS;
        this.publishedSiteUrl = siteUrl;
    }

    public boolean isCompleted() {
        return "COMPLETED".equals(this.status);
    }

    /** Step 1 분석 결과 JSON 저장 */
    public void saveStepData(String json) {
        this.stepCompletedAtJson = json;
    }
}
