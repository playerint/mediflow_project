package io.mediflow.core.onboarding.dto;

import java.util.List;

/** ai-service 분석 결과 — 프론트엔드에 camelCase로 전달 */
public record AnalyzeResultDto(
        Long hospitalId,
        String clinicType,
        List<String> specialties,
        List<String> suggestedKeywordsJa
) {}
