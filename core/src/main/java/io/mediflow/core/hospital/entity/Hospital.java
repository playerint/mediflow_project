package io.mediflow.core.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "hospitals")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 한국어 병원명 */
    @Column(nullable = false, length = 100)
    private String nameKr;

    /** 일본어 병원명 */
    @Column(length = 100)
    private String nameJa;

    /** 진료과 유형 */
    @Column(nullable = false, length = 50)
    private String clinicType;

    /** 세부 진료과 */
    @Column(length = 100)
    private String specialty;

    /** 플랜 (Basic / Pro / Enterprise) */
    @Column(nullable = false, length = 20)
    private String plan;

    /** 상태 (active / onboarding / paused) */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "onboarding";

    /** 담당 매니저명 */
    @Column(length = 50)
    private String managerName;

    /** 담당 매니저 이메일 */
    @Column(length = 100)
    private String managerEmail;

    /** 계약 시작일 */
    private LocalDate contractStart;

    /** 계약 만료일 */
    private LocalDate contractExpire;

    /** 환자용 사이트 URL (온보딩 완료 후 생성) */
    @Column(length = 200)
    private String siteUrl;

    /** 병원 전화번호 */
    @Column(length = 50)
    private String phone;

    /** 병원 주소 */
    @Column(length = 200)
    private String address;

    /** 영업시간 */
    @Column(length = 100)
    private String hours;

    /** LINE 공식 계정 ID */
    @Column(length = 100)
    private String lineId;

    /** 인스타그램 ID */
    @Column(length = 100)
    private String instagramId;

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
}
