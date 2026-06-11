package io.mediflow.core.platformbo.marketing.controller;

import io.mediflow.core.platformbo.marketing.dto.HospitalMarketingStatsDto;
import io.mediflow.core.platformbo.marketing.service.PlatformMarketingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 본사용 BO — 마케팅 지표 API.
 * 인증: SecurityConfig의 anyRequest().authenticated() 적용.
 */
@RestController
@RequestMapping("/api/v1/platform/marketing")
@RequiredArgsConstructor
public class PlatformMarketingController {

    private final PlatformMarketingService platformMarketingService;

    /**
     * GET /api/v1/platform/marketing/stats
     * 전체 병원의 마케팅 지표(AEO·SEO·LINE) 반환 — AEO 점수 내림차순.
     */
    @GetMapping("/stats")
    public ResponseEntity<List<HospitalMarketingStatsDto>> getStats() {
        return ResponseEntity.ok(platformMarketingService.getAllStats());
    }
}
