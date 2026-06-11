package io.mediflow.core.hospitalbo.reports.controller;

import io.mediflow.core.hospitalbo.reports.dto.ReportSummaryResponse;
import io.mediflow.core.hospitalbo.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 병원 운영자(hospital-bo) — 리포트 API.
 * JWT 인증은 SecurityConfig + JwtAuthFilter 에서 공통 처리.
 */
@RestController
@RequestMapping("/api/v1/hospital/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * GET /api/v1/hospital/reports/summary
     * 월별 핵심 KPI 요약 반환.
     */
    @GetMapping("/summary")
    public ResponseEntity<ReportSummaryResponse> getSummary() {
        return ResponseEntity.ok(reportService.getSummary());
    }
}
