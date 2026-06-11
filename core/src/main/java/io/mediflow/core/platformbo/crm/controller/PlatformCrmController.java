package io.mediflow.core.platformbo.crm.controller;

import io.mediflow.core.platformbo.crm.dto.HospitalCrmSummaryDto;
import io.mediflow.core.platformbo.crm.service.PlatformCrmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 본사용 BO — CRM 통계 API.
 * 인증: SecurityConfig의 anyRequest().authenticated() 적용.
 */
@RestController
@RequestMapping("/api/v1/platform/crm")
@RequiredArgsConstructor
public class PlatformCrmController {

    private final PlatformCrmService platformCrmService;

    /**
     * GET /api/v1/platform/crm/stats
     * 전체 병원의 상담 상태(new/pending/replied) 카운트 반환.
     */
    @GetMapping("/stats")
    public ResponseEntity<List<HospitalCrmSummaryDto>> getStats() {
        return ResponseEntity.ok(platformCrmService.getAllStats());
    }
}
