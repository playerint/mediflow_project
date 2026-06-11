package io.mediflow.core.platformbo.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 본사용 알림 엔티티.
 * platform_notifications 테이블에 저장된다.
 */
@Entity
@Table(name = "platform_notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PlatformNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 알림 유형: cs / contract / compliance / system */
    @Column(nullable = false, length = 20)
    private String type;

    /** 알림 제목 */
    @Column(nullable = false, length = 200)
    private String title;

    /** 알림 본문 */
    @Column(nullable = false, length = 500)
    private String body;

    /** 읽음 여부 (기본값 false) */
    @Column(nullable = false)
    @Builder.Default
    private boolean read = false;

    /** 생성 시각 — @PrePersist 자동 설정 */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    private void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /** 읽음 처리 */
    public void markAsRead() {
        this.read = true;
    }
}
