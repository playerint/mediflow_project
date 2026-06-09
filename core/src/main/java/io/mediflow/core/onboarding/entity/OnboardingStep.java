package io.mediflow.core.onboarding.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 온보딩 9단계 정의.
 * 순서(stepNumber)는 변경하면 기존 데이터가 깨지므로 수정 금지.
 */
@Getter
@RequiredArgsConstructor
public enum OnboardingStep {

    STEP_1(1, "병원 자동 분석",     "병원 웹사이트 URL 크롤링 및 콘텐츠 자동 추출"),
    STEP_2(2, "SEO·AEO 전략 수립", "AI 기반 일본어 검색 키워드 전략 수립"),
    STEP_3(3, "사이트 템플릿 선택", "환자용 사이트 디자인 템플릿 선택"),
    STEP_4(4, "이미지 업로드",      "병원 대표 이미지 및 시술 사진 업로드"),
    STEP_5(5, "일본어 카피 검수",   "AI 재집필 일본어 콘텐츠 검토 및 수정"),
    STEP_6(6, "컴플라이언스 검사",  "의료 광고법 준수 여부 자동 검사"),
    STEP_7(7, "채널 연동",          "LINE 공식 채널 및 CRM 웹훅 연결"),
    STEP_8(8, "SEO 최종 설정",      "메타태그·구조화 데이터·FAQ 최적화"),
    STEP_9(9, "최종 검토 및 게시",  "전체 사이트 검토 후 환자용 사이트 게시");

    private final int    stepNumber;
    private final String name;
    private final String description;

    public static OnboardingStep of(int stepNumber) {
        for (OnboardingStep s : values()) {
            if (s.stepNumber == stepNumber) return s;
        }
        throw new IllegalArgumentException("유효하지 않은 온보딩 단계: " + stepNumber);
    }

    public static final int TOTAL_STEPS = 9;
}
