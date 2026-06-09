package io.mediflow.core.common.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/** Python ai-service /analyze 응답 역직렬화 전용 (snake_case → Java record) */
record AiAnalyzeInternalResponse(
        @JsonProperty("hospital_id")           Long         hospitalId,
        @JsonProperty("clinic_type")           String       clinicType,
                                               List<String> specialties,
        @JsonProperty("suggested_keywords_ja") List<String> suggestedKeywordsJa
) {}
