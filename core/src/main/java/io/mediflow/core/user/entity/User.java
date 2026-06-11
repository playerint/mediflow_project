package io.mediflow.core.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 시스템 사용자 계정.
 * platform-bo 사용자: hospitalId = null
 * hospital-bo 사용자: hospitalId = 소속 병원 ID
 */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;   // 이메일로 사용

    @Column(nullable = false)
    private String password;   // BCrypt 해시

    /** SUPER, OPS, FINANCE, HOSPITAL_ADMIN, HOSPITAL_STAFF */
    @Column(nullable = false, length = 30)
    private String role;

    /** platform-bo 사용자는 null, hospital-bo 사용자는 병원 ID */
    @Column
    private Long hospitalId;

    @Column(length = 50)
    private String displayName;   // 이름 (예: 김운영)

    @Column(length = 20)
    private String phone;         // 연락처

    @Column(length = 100)
    private String company;       // 소속 회사

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public void updateProfile(String displayName, String phone, String company) {
        this.displayName = displayName;
        this.phone = phone;
        this.company = company;
    }
}
