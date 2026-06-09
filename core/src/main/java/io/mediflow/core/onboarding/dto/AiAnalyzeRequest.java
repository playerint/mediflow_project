package io.mediflow.core.onboarding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/** ai-service POST /analyze 요청 바디 */
public record AiAnalyzeRequest(
        @JsonProperty("hospital_id") Long hospitalId,
        String url
) {}
