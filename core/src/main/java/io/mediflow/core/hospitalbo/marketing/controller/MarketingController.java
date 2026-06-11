package io.mediflow.core.hospitalbo.marketing.controller;

import io.mediflow.core.hospitalbo.marketing.dto.MarketingStatsResponse;
import io.mediflow.core.hospitalbo.marketing.service.MarketingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 병원 운영자(hospital-bo) — 마케팅 현황 API.
 * JWT 인증은 SecurityConfig + JwtAuthFilter 에서 공통 처리.
 */
@RestController
@RequestMapping("/api/v1/hospital/marketing")
@RequiredArgsConstructor
public class MarketingController {

    private final MarketingService marketingService;

    /**
     * GET /api/v1/hospital/marketing/stats
     * 채널별 유입 통계 및 월별 트렌드 반환.
     */
    @GetMapping("/stats")
    public ResponseEntity<MarketingStatsResponse> getStats(
            @RequestParam(required = false, defaultValue = "") String period) {
        return ResponseEntity.ok(marketingService.getMarketingStats(period));
    }
}
