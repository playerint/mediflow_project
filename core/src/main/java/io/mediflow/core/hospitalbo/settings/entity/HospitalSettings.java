package io.mediflow.core.hospitalbo.settings.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 병원 운영 설정 엔티티.
 *
 * 플랫폼 DB의 hospital_settings 테이블과 매핑한다.
 * hospital_id 는 UNIQUE — 병원 1개당 설정 행이 1개다.
 *
 * 환자 정보가 아니므로 플랫폼(공유) DB에 저장해도 법적으로 무관하다
 * (CLAUDE.md 4-0 참고).
 */
@Entity
@Table(name = "hospital_settings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class HospitalSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 병원 식별자 — UNIQUE (hospital_id당 설정 1행) */
    @Column(name = "hospital_id", nullable = false, unique = true)
    private Long hospitalId;

    /** 영업시간 (예: "09:00-18:00") */
    @Column(name = "business_hours", length = 20)
    @Builder.Default
    private String businessHours = "09:00-18:00";

    /** 점심시간 (예: "12:00-13:00") */
    @Column(name = "lunch_break", length = 20)
    @Builder.Default
    private String lunchBreak = "12:00-13:00";

    /**
     * 휴무일 (CSV 형식, 예: "일요일,공휴일").
     * DTO 의 List<String> 과 변환이 필요하다 — 서비스 레이어에서 처리.
     */
    @Column(name = "closed_days", columnDefinition = "TEXT")
    @Builder.Default
    private String closedDays = "일요일";

    /** 알림 수신 이메일 */
    @Column(name = "notification_email", length = 255)
    private String notificationEmail;

    /** 자동 답장 활성화 여부 */
    @Column(name = "auto_reply_enabled")
    @Builder.Default
    private boolean autoReplyEnabled = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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

    // ── 설정 필드 업데이트 (서비스에서 호출) ─────────────────────────────

    public void update(String businessHours, String lunchBreak, String closedDays,
                       String notificationEmail, boolean autoReplyEnabled) {
        this.businessHours    = businessHours;
        this.lunchBreak       = lunchBreak;
        this.closedDays       = closedDays;
        this.notificationEmail = notificationEmail;
        this.autoReplyEnabled = autoReplyEnabled;
    }
}
