package io.mediflow.core.hospitalbo.reports.service;

import io.mediflow.core.common.tenant.TenantContext;
import io.mediflow.core.hospitalbo.reports.dto.ReportSummaryResponse;
import io.mediflow.core.hospitalbo.reports.dto.ReportSummaryResponse.ProcedureStat;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 리포트 서비스.
 *
 * 현재는 하드코딩 목업 데이터를 반환한다.
 * 추후 hospitalId 로 hospital_N 스키마의 실제 데이터로 교체 예정.
 */
@Service
public class ReportService {

    private Long requireHospitalId() {
        Long id = TenantContext.getHospitalId();
        if (id == null) throw new SecurityException("병원 인증이 필요합니다.");
        return id;
    }

    /**
     * 월별 핵심 지표 요약 조회.
     * TODO: hospitalId 와 period 파라미터를 이용해 hospital_{id} 스키마에서 집계.
     */
    public ReportSummaryResponse getSummary() {
        requireHospitalId(); // 테넌트 격리 확인 — 반드시 유지

        List<ProcedureStat> topProcedures = List.of(
                new ProcedureStat("쌍꺼풀", 18),
                new ProcedureStat("코",    12)
        );

        return new ReportSummaryResponse(
                "2026-06",
                24,
                89,
                31,
                34.8,
                topProcedures
        );
    }
}
