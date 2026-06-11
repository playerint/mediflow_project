package io.mediflow.core.common.config;

import io.mediflow.core.onboarding.entity.OnboardingStepData;
import io.mediflow.core.onboarding.repository.OnboardingStepDataRepository;
import io.mediflow.core.platformbo.cs.entity.CsTicket;
import io.mediflow.core.platformbo.cs.repository.CsTicketRepository;
import io.mediflow.core.platformbo.marketing.entity.HospitalMarketingStats;
import io.mediflow.core.platformbo.marketing.repository.HospitalMarketingStatsRepository;
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

    private final UserRepository                    userRepository;
    private final PasswordEncoder                   passwordEncoder;
    private final PlatformNotificationRepository    notificationRepository;
    private final CsTicketRepository                csTicketRepository;
    private final HospitalMarketingStatsRepository  marketingStatsRepository;
    private final OnboardingStepDataRepository      stepDataRepository;

    @Override
    public void run(ApplicationArguments args) {
        createIfAbsent("admin@mediflow.io",   "admin1234",    "SUPER",          null);
        createIfAbsent("ops@mediflow.io",     "ops1234",      "OPS",            null);
        createIfAbsent("finance@mediflow.io", "finance1234",  "FINANCE",        null);
        createIfAbsent("h1@mediflow.io",      "hospital1234", "HOSPITAL_ADMIN", 1L);
        createIfAbsent("h2@mediflow.io",      "hospital1234", "HOSPITAL_ADMIN", 2L);
        log.info("=== 개발용 기본 계정 초기화 완료 ===");

        seedNotifications();
        seedCsTickets();
        seedMarketingStats();
        seedStep2Content();
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

    /** CS 티켓 초기 데이터 7건 삽입 (데이터가 없을 때만) */
    private void seedCsTickets() {
        if (csTicketRepository.count() > 0) {
            return;
        }

        csTicketRepository.saveAll(List.of(
                CsTicket.builder()
                        .hospitalName("올래성형외과")
                        .type("불만")
                        .title("일본어 문의 48시간 무응답")
                        .status("open")
                        .priority("high")
                        .build(),
                CsTicket.builder()
                        .hospitalName("청담미래성형외과")
                        .type("컴플라이언스")
                        .title("광고 표현 위반 2건 감지")
                        .status("progress")
                        .priority("high")
                        .build(),
                CsTicket.builder()
                        .hospitalName("압구정원성형외과")
                        .type("문의")
                        .title("사이트 업데이트 방법 문의")
                        .status("progress")
                        .priority("mid")
                        .build(),
                CsTicket.builder()
                        .hospitalName("강남뷰티클리닉")
                        .type("오류")
                        .title("LINE 봇 연결 오류 발생")
                        .status("open")
                        .priority("high")
                        .build(),
                CsTicket.builder()
                        .hospitalName("반포미성형외과")
                        .type("문의")
                        .title("예약 시스템 추가 기능 요청")
                        .status("closed")
                        .priority("low")
                        .build(),
                CsTicket.builder()
                        .hospitalName("신사라인성형외과")
                        .type("불만")
                        .title("대시보드 수치 오차 이의")
                        .status("closed")
                        .priority("mid")
                        .build(),
                CsTicket.builder()
                        .hospitalName("논현더플러스")
                        .type("문의")
                        .title("SEO 점수 개선 컨설팅 요청")
                        .status("open")
                        .priority("low")
                        .build()
        ));

        log.info("=== CS 티켓 초기 데이터 7건 삽입 완료 ===");
    }

    /** 병원 마케팅 지표 초기 데이터 5건 삽입 (데이터가 없을 때만) */
    private void seedMarketingStats() {
        if (marketingStatsRepository.count() > 0) {
            return;
        }

        marketingStatsRepository.saveAll(List.of(
                HospitalMarketingStats.builder()
                        .hospitalId(1L)
                        .hospitalName("올래성형외과")
                        .aeoScore(58)
                        .seoScore(82)
                        .lineFollowers(1240)
                        .aeoWeeklyChange(11)
                        .build(),
                HospitalMarketingStats.builder()
                        .hospitalId(2L)
                        .hospitalName("강남뷰티클리닉")
                        .aeoScore(44)
                        .seoScore(76)
                        .lineFollowers(890)
                        .aeoWeeklyChange(7)
                        .build(),
                HospitalMarketingStats.builder()
                        .hospitalId(3L)
                        .hospitalName("청담미래성형외과")
                        .aeoScore(94)
                        .seoScore(91)
                        .lineFollowers(3100)
                        .aeoWeeklyChange(23)
                        .build(),
                HospitalMarketingStats.builder()
                        .hospitalId(5L)
                        .hospitalName("신사라인성형외과")
                        .aeoScore(31)
                        .seoScore(68)
                        .lineFollowers(560)
                        .aeoWeeklyChange(4)
                        .build(),
                HospitalMarketingStats.builder()
                        .hospitalId(8L)
                        .hospitalName("논현더플러스")
                        .aeoScore(22)
                        .seoScore(60)
                        .lineFollowers(420)
                        .aeoWeeklyChange(-2)
                        .build()
        ));

        log.info("=== 병원 마케팅 지표 초기 데이터 5건 삽입 완료 ===");
    }

    /** hospital_id=1 의 Step 2 (의료진·시술·후기) 초기 데이터 삽입 또는 갱신 */
    private void seedStep2Content() {
        String step2Json = """
                {
                  "doctors": [
                    {"nameJa": "キム・ジフン 院長", "specialty": "目元・埋没法", "experience": "美容外科専門医 15年", "gradient": "from-rose-100 to-pink-200"},
                    {"nameJa": "イ・スヨン 副院長", "specialty": "鼻整形・輪郭手術", "experience": "形成外科専門医 12年", "gradient": "from-indigo-100 to-purple-200"},
                    {"nameJa": "パク・ミン 医師", "specialty": "皮膚科・レーザー治療", "experience": "皮膚科専門医 8年", "gradient": "from-emerald-100 to-teal-200"}
                  ],
                  "treatments": [
                    {"nameJa": "二重整形（埋没法）", "duration": "30分", "category": "目元", "emoji": "👁️"},
                    {"nameJa": "二重整形（切開法）", "duration": "60分", "category": "目元", "emoji": "👁️"},
                    {"nameJa": "鼻整形（プロテーゼ）", "duration": "90分", "category": "鼻", "emoji": "👃"},
                    {"nameJa": "エラボトックス", "duration": "15分", "category": "輪郭", "emoji": "💉"},
                    {"nameJa": "脂肪吸引", "duration": "120分", "category": "ボディ", "emoji": "✨"},
                    {"nameJa": "目頭切開", "duration": "45分", "category": "目元", "emoji": "👁️"},
                    {"nameJa": "ヒアルロン酸注入", "duration": "20分", "category": "スキン", "emoji": "💧"},
                    {"nameJa": "フェイスリフト", "duration": "180分", "category": "輪郭", "emoji": "✨"},
                    {"nameJa": "レーザートーニング", "duration": "30分", "category": "スキン", "emoji": "💫"}
                  ],
                  "reviews": [
                    {"name": "さくら（28歳・東京）", "treatment": "二重整形（埋没法）", "text": "日本語対応のスタッフがいて安心でした。術後のケアも丁寧で、自然な仕上がりに大満足です！", "rating": 5},
                    {"name": "はな（25歳・大阪）", "treatment": "鼻整形（プロテーゼ）", "text": "思っていた以上に自然な仕上がりでとても満足しています。先生の説明も丁寧でした。", "rating": 5},
                    {"name": "みのり（32歳・名古屋）", "treatment": "エラボトックス", "text": "施術後すぐに効果を実感。スタッフも日本語が話せて不安なく相談できました。", "rating": 4},
                    {"name": "ゆい（23歳・福岡）", "treatment": "目頭切開＋埋没法", "text": "韓国での手術を迷っていましたが、丁寧なカウンセリングで決心できました。大満足！", "rating": 5},
                    {"name": "えりか（35歳・札幌）", "treatment": "ヒアルロン酸注入", "text": "初めての美容施術でしたが、先生が優しく説明してくださいました。また来たいです。", "rating": 5}
                  ]
                }
                """;

        stepDataRepository.findByHospitalIdAndStepNumber(1L, 2).ifPresentOrElse(
                existing -> {
                    existing.updateData(step2Json, true);
                    stepDataRepository.save(existing);
                    log.info("=== hospital_id=1 Step 2 reviews 추가로 데이터 갱신 완료 ===");
                },
                () -> {
                    OnboardingStepData entity = OnboardingStepData.builder()
                            .hospitalId(1L)
                            .stepNumber(2)
                            .data(step2Json)
                            .build();
                    stepDataRepository.save(entity);
                    log.info("=== hospital_id=1 Step 2 의료진·시술·후기 초기 데이터 삽입 완료 ===");
                }
        );
    }
}
