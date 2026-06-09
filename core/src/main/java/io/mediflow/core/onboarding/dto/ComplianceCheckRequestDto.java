package io.mediflow.core.onboarding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/** ai-service POST /compliance/check 요청 바디 */
public record ComplianceCheckRequestDto(
        @JsonProperty("hospital_id") Long hospitalId,
        String content
) {}
