package io.mediflow.core.onboarding.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 온보딩 각 단계의 실제 콘텐츠를 저장.
 * (hospitalId, stepNumber) 쌍으로 단계별 데이터를 1행씩 관리.
 *
 * data 컬럼: JSON 문자열로 저장 (단계별 구조가 다르므로 TEXT로 유연하게 관리)
 * - Step 1: 자동 분석 결과 (10개 섹션 콘텐츠, SEO 키워드 등)
 * - Step 3: 선택한 템플릿 ID
 * - Step 4: 업로드된 이미지 경로 목록
 * - Step 5: 10개 섹션 한국어→일본어 카피
 * - Step 6: 광고법 위반 검사 결과
 * - Step 7: LINE·Instagram 연동 정보
 */
@Entity
@Table(
    name = "onboarding_step_data",
    uniqueConstraints = @UniqueConstraint(columnNames = {"hospital_id", "step_number"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OnboardingStepData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** CLAUDE.md 4-1: 병원별 데이터 격리 */
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    /** 온보딩 단계 번호 (1~9) */
    @Column(name = "step_number", nullable = false)
    private int stepNumber;

    /** 단계별 콘텐츠 (JSON 문자열) */
    @Column(columnDefinition = "TEXT")
    private String data;

    /** 이 단계가 완료된 시각 (null이면 미완료) */
    private LocalDateTime completedAt;

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

    /** 데이터 저장 및 완료 처리 */
    public void updateData(String data, boolean markCompleted) {
        this.data = data;
        if (markCompleted) {
            this.completedAt = LocalDateTime.now();
        }
    }
}
