package io.mediflow.core.common.config;

import io.mediflow.core.platformbo.notification.entity.PlatformNotification;
import io.mediflow.core.platformbo.notification.repository.PlatformNotificationRepository;
import io.mediflow.core.user.entity.User;
import io.mediflow.core.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 앱 시작 시 개발용 기본 계정 및 초기 데이터를 자동 생성한다.
 * 이미 존재하면 건너뜀.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository                 userRepository;
    private final PasswordEncoder                passwordEncoder;
    private final PlatformNotificationRepository notificationRepository;

    @Override
    public void run(ApplicationArguments args) {
        createIfAbsent("admin@mediflow.io",   "admin1234",    "SUPER",          null);
        createIfAbsent("ops@mediflow.io",     "ops1234",      "OPS",            null);
        createIfAbsent("finance@mediflow.io", "finance1234",  "FINANCE",        null);
        createIfAbsent("h1@mediflow.io",      "hospital1234", "HOSPITAL_ADMIN", 1L);
        createIfAbsent("h2@mediflow.io",      "hospital1234", "HOSPITAL_ADMIN", 2L);
        log.info("=== 개발용 기본 계정 초기화 완료 ===");

        seedNotifications();
    }

    private void createIfAbsent(String username, String rawPw, String role, Long hospitalId) {
        if (!userRepository.existsByUsername(username)) {
            userRepository.save(User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(rawPw))
                    .role(role)
                    .hospitalId(hospitalId)
                    .build());
            log.info("계정 생성: {} ({})", username, role);
        }
    }

    /** 본사 알림 초기 데이터 7건 삽입 (데이터가 없을 때만) */
    private void seedNotifications() {
        if (notificationRepository.count() > 0) {
            return;
        }

        notificationRepository.saveAll(List.of(
                PlatformNotification.builder()
                        .type("cs")
                        .title("미답변 48시간 초과")
                        .body("올래성형외과 — 田中 花子 님의 문의가 48시간 미답변입니다.")
                        .read(false)
                        .build(),
                PlatformNotification.builder()
                        .type("compliance")
                        .title("광고 표현 위반 감지")
                        .body("청담미래성형외과 사이트에서 의료광고법 위반 표현 2건 감지.")
                        .read(false)
                        .build(),
                PlatformNotification.builder()
                        .type("contract")
                        .title("계약 만료 22일 전")
                        .body("압구정원성형외과 계약이 2026-06-30 만료 예정입니다.")
                        .read(false)
                        .build(),
                PlatformNotification.builder()
                        .type("cs")
                        .title("LINE 봇 연결 오류")
                        .body("강남뷰티클리닉 LINE 채널 자동상담이 끊겼습니다.")
                        .read(false)
                        .build(),
                PlatformNotification.builder()
                        .type("contract")
                        .title("계약 만료 7일 전")
                        .body("역삼유나이티드 계약이 2026-06-05 만료됩니다.")
                        .read(true)
                        .build(),
                PlatformNotification.builder()
                        .type("system")
                        .title("신규 병원 온보딩 완료")
                        .body("논현더플러스의 9단계 온보딩이 완료됐습니다.")
                        .read(true)
                        .build(),
                PlatformNotification.builder()
                        .type("compliance")
                        .title("SEO 점수 하락")
                        .body("반포미성형외과 SEO 점수가 68점에서 55점으로 하락했습니다.")
                        .read(true)
                        .build()
        ));

        log.info("=== 본사 알림 초기 데이터 7건 삽입 완료 ===");
    }
}
