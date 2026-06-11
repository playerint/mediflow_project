-- ─────────────────────────────────────────────────────────────
-- V1: hospital_settings 테이블 생성
-- 병원별 운영 설정(영업시간·알림 등)을 플랫폼 DB에 보관한다.
-- 환자 정보가 아니므로 플랫폼 DB 저장이 법적으로 허용된다(CLAUDE.md 4-0).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hospital_settings (
    id                   BIGSERIAL PRIMARY KEY,
    hospital_id          BIGINT        NOT NULL UNIQUE,
    business_hours       VARCHAR(20)   DEFAULT '09:00-18:00',
    lunch_break          VARCHAR(20)   DEFAULT '12:00-13:00',
    closed_days          TEXT          DEFAULT '일요일',
    notification_email   VARCHAR(255),
    auto_reply_enabled   BOOLEAN       DEFAULT true,
    created_at           TIMESTAMP     DEFAULT NOW(),
    updated_at           TIMESTAMP     DEFAULT NOW()
);
