package io.mediflow.core.onboarding.dto;

import java.util.List;
import java.util.Map;

/** 컴플라이언스 검사 결과 — 프론트엔드에 camelCase로 전달 */
public record ComplianceCheckResultDto(
        Long hospitalId,
        boolean compliant,
        List<Map<String, String>> violations,
        List<String> suggestions
) {}
