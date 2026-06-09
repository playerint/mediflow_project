package io.mediflow.core.onboarding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/** ai-service 분석 결과 — 프론트엔드에도 그대로 전달 */
public record AnalyzeResultDto(
        @JsonProperty("hospital_id")          Long         hospitalId,
        @JsonProperty("clinic_type")          String       clinicType,
        List<String>                                       specialties,
        @JsonProperty("suggested_keywords_ja") List<String> suggestedKeywordsJa
) {}
