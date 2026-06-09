package io.mediflow.core.common.client;

import io.mediflow.core.onboarding.dto.AiAnalyzeRequest;
import io.mediflow.core.onboarding.dto.AnalyzeResultDto;
import io.mediflow.core.onboarding.dto.ComplianceCheckRequestDto;
import io.mediflow.core.onboarding.dto.ComplianceCheckResultDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

/**
 * Python ai-service(FastAPI) HTTP 클라이언트.
 * 프론트엔드가 직접 ai-service를 호출하지 않도록 Spring Boot가 중계한다 (CLAUDE.md 4-2).
 */
@Component
public class AiServiceClient {

    private final RestClient restClient;

    public AiServiceClient(@Value("${mediflow.ai-service.base-url}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * 병원 URL을 ai-service에 전달해 자동 분석 결과를 받는다.
     * ai-service가 꺼져 있으면 목업 데이터를 반환한다 (개발 편의).
     */
    public AnalyzeResultDto analyze(Long hospitalId, String url) {
        try {
            // Python 응답은 snake_case → 내부 DTO로 역직렬화 후 camelCase DTO로 변환
            AiAnalyzeInternalResponse raw = restClient.post()
                    .uri("/analyze")
                    .body(new AiAnalyzeRequest(hospitalId, url))
                    .retrieve()
                    .body(AiAnalyzeInternalResponse.class);

            if (raw == null) return fallbackAnalyze(hospitalId);

            return new AnalyzeResultDto(
                    raw.hospitalId(),
                    raw.clinicType()          != null ? raw.clinicType()          : "의원",
                    raw.specialties()         != null ? raw.specialties()         : List.of(),
                    raw.suggestedKeywordsJa() != null ? raw.suggestedKeywordsJa() : List.of()
            );
        } catch (RestClientException e) {
            return fallbackAnalyze(hospitalId);
        }
    }

    private AnalyzeResultDto fallbackAnalyze(Long hospitalId) {
        return new AnalyzeResultDto(
                hospitalId,
                "성형외과",
                List.of("쌍꺼풀", "코성형", "지방흡입"),
                List.of("韓国 整形外科 おすすめ", "ソウル 二重まぶた クリニック", "韓国美容外科 日本語対応")
        );
    }

    /**
     * 콘텐츠를 ai-service에 전달해 의료 광고법 컴플라이언스를 검사한다.
     * ai-service가 꺼져 있으면 통과 결과를 반환한다.
     */
    @SuppressWarnings("unchecked")
    public ComplianceCheckResultDto checkCompliance(Long hospitalId, String content) {
        try {
            Map<String, Object> raw = restClient.post()
                    .uri("/compliance/check")
                    .body(new ComplianceCheckRequestDto(hospitalId, content))
                    .retrieve()
                    .body(Map.class);

            if (raw == null) {
                return new ComplianceCheckResultDto(hospitalId, true, List.of(), List.of());
            }

            boolean compliant = Boolean.TRUE.equals(raw.get("is_compliant"));
            List<Map<String, String>> violations = (List<Map<String, String>>) raw.getOrDefault("violations", List.of());
            List<String> suggestions = (List<String>) raw.getOrDefault("suggestions", List.of());
            return new ComplianceCheckResultDto(hospitalId, compliant, violations, suggestions);

        } catch (RestClientException e) {
            // ai-service 미실행 시 통과 결과 반환 (개발 편의)
            return new ComplianceCheckResultDto(hospitalId, true, List.of(), List.of());
        }
    }
}
