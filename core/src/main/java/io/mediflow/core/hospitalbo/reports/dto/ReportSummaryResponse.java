package io.mediflow.core.hospitalbo.reports.dto;

import java.util.List;

/**
 * GET /api/v1/hospital/reports/summary 응답 DTO.
 * 월별 핵심 KPI + 인기 시술 목록.
 */
public record ReportSummaryResponse(
        String period,
        int newPatients,
        int consultations,
        int bookings,
        double conversionRate,
        List<ProcedureStat> topProcedures
) {

    public record ProcedureStat(
            String name,
            int count
    ) {}
}
