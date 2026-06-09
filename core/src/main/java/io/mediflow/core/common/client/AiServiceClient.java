package io.mediflow.core.common.client;

import io.mediflow.core.onboarding.dto.AiAnalyzeRequest;
import io.mediflow.core.onboarding.dto.AnalyzeResultDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

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
     * ai-service가 꺼져 있으면 RuntimeException 대신 목업 데이터를 반환한다 (개발 편의).
     */
    public AnalyzeResultDto analyze(Long hospitalId, String url) {
        try {
            return restClient.post()
                    .uri("/analyze")
                    .body(new AiAnalyzeRequest(hospitalId, url))
                    .retrieve()
                    .body(AnalyzeResultDto.class);
        } catch (RestClientException e) {
            // ai-service 미실행 상태에서도 온보딩 흐름 테스트 가능하도록 목업 반환
            return new AnalyzeResultDto(
                    hospitalId,
                    "성형외과",
                    java.util.List.of("쌍꺼풀", "코성형", "지방흡입"),
                    java.util.List.of("韓国 整形外科 おすすめ", "ソウル 二重まぶた クリニック", "韓国美容外科 日本語対応")
            );
        }
    }
}
