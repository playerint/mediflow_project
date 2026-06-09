package io.mediflow.core.common.config;

import io.mediflow.core.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 앱 시작 시 등록된 병원마다 전용 스키마(hospital_N)를 생성한다.
 *
 * 왜 스키마 분리인가?
 *   CLAUDE.md 4-0: 환자·상담 데이터는 법적 요구로 병원별 DB에 보관.
 *   완전한 서버 분리는 CTO/법무 확인 후 적용하고, 개발 단계에서는
 *   같은 PostgreSQL 인스턴스 안에 hospital_N 스키마로 논리 분리한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HospitalSchemaInitializer implements ApplicationRunner {

    private final HospitalRepository hospitalRepository;
    private final JdbcTemplate        jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        hospitalRepository.findAll().forEach(hospital -> {
            Long id = hospital.getId();
            createSchema(id);
            log.info("병원 스키마 준비 완료: hospital_{}", id);
        });
    }

    /** 새 병원이 등록될 때도 호출 가능 */
    public void createSchema(Long hospitalId) {
        String s = "hospital_" + hospitalId;
        jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS " + s);

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS %s.patients (
                id                   BIGSERIAL PRIMARY KEY,
                name_ja              VARCHAR(100) NOT NULL,
                name_ko              VARCHAR(100),
                email                VARCHAR(255),
                phone                VARCHAR(50),
                age                  INT,
                gender               VARCHAR(10),
                country              VARCHAR(10)  DEFAULT 'JP',
                preferred_treatment  VARCHAR(200),
                status               VARCHAR(20)  DEFAULT 'active',
                created_at           TIMESTAMP    DEFAULT NOW(),
                updated_at           TIMESTAMP    DEFAULT NOW()
            )""".formatted(s));

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS %s.consultations (
                id           BIGSERIAL PRIMARY KEY,
                patient_id   BIGINT REFERENCES %s.patients(id) ON DELETE CASCADE,
                channel      VARCHAR(20)  DEFAULT 'LINE',
                treatment    VARCHAR(200),
                message      TEXT,
                status       VARCHAR(20)  DEFAULT 'new',
                assigned_to  VARCHAR(100),
                created_at   TIMESTAMP    DEFAULT NOW(),
                replied_at   TIMESTAMP
            )""".formatted(s, s));

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS %s.bookings (
                id           BIGSERIAL PRIMARY KEY,
                patient_id   BIGINT REFERENCES %s.patients(id) ON DELETE CASCADE,
                treatment    VARCHAR(200),
                doctor       VARCHAR(100),
                scheduled_at TIMESTAMP    NOT NULL,
                status       VARCHAR(20)  DEFAULT 'pending',
                notes        TEXT,
                created_at   TIMESTAMP    DEFAULT NOW()
            )""".formatted(s, s));

        insertSampleData(hospitalId, s);
    }

    /** 개발용 샘플 데이터 — 이미 있으면 삽입하지 않음 */
    private void insertSampleData(Long hospitalId, String s) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM " + s + ".patients", Integer.class);
        if (count != null && count > 0) return;

        jdbcTemplate.update("""
            INSERT INTO %s.patients (name_ja, name_ko, email, phone, age, gender, country, preferred_treatment)
            VALUES
              ('田中さくら', '다나카 사쿠라', 'sakura@example.jp', '+81-90-1234-5678', 28, 'F', 'JP', '二重整形'),
              ('鈴木はな',   '스즈키 하나',   'hana@example.jp',   '+81-90-2345-6789', 25, 'F', 'JP', '鼻整形'),
              ('佐藤みか',   '사토 미카',     'mika@example.jp',   '+81-90-3456-7890', 32, 'F', 'JP', 'エラボトックス'),
              ('山田ゆい',   '야마다 유이',   'yui@example.jp',    '+81-90-4567-8901', 23, 'F', 'JP', '二重整形'),
              ('伊藤あい',   '이토 아이',     'ai@example.jp',     '+81-90-5678-9012', 29, 'F', 'JP', 'ヒアルロン酸')
            """.formatted(s));

        jdbcTemplate.update("""
            INSERT INTO %s.consultations (patient_id, channel, treatment, message, status)
            VALUES
              (1, 'LINE',      '二重整形（埋没法）',   'ダウンタイムはどれくらいですか？', 'new'),
              (2, 'LINE',      '鼻整形（プロテーゼ）', '韓国語が話せなくても大丈夫ですか？', 'replied'),
              (3, 'Instagram', 'エラボトックス',       '費用を教えてください。', 'new'),
              (4, 'LINE',      '二重整形（切開法）',   '切開法と埋没法の違いは？', 'pending'),
              (5, 'LINE',      'ヒアルロン酸注入',     'どのくらい持続しますか？', 'replied')
            """.formatted(s));

        jdbcTemplate.update("""
            INSERT INTO %s.bookings (patient_id, treatment, doctor, scheduled_at, status)
            VALUES
              (1, '二重整形（埋没法）', 'キム・ジフン院長', NOW() + INTERVAL '3 days', 'confirmed'),
              (2, '鼻整形',             'イ・スヨン副院長', NOW() + INTERVAL '7 days', 'pending')
            """.formatted(s));
    }
}
