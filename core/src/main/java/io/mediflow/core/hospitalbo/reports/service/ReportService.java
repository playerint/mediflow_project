package io.mediflow.core.hospitalbo.reports.service;

import io.mediflow.core.common.tenant.TenantContext;
import io.mediflow.core.hospitalbo.reports.dto.ReportSummaryResponse;
import io.mediflow.core.hospitaldb.repository.HospitalDbRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final HospitalDbRepository repo;

    private Long requireHospitalId() {
        Long id = TenantContext.getHospitalId();
        if (id == null) throw new SecurityException("병원 인증이 필요합니다.");
        return id;
    }

    public ReportSummaryResponse getSummary(String period) {
        Long hospitalId = requireHospitalId();
        LocalDateTime[] range = parsePeriodRange(period);
        LocalDateTime start = range != null ? range[0] : null;
        LocalDateTime end   = range != null ? range[1] : null;

        String periodLabel = (period != null && !period.isBlank()) ? period
                : YearMonth.now().toString();

        int newPatients   = repo.countPatients(hospitalId, start, end);
        int consultations = repo.countConsultationsRange(hospitalId, start, end);
        int bookings      = repo.countBookingsRange(hospitalId, start, end);
        double conversion = repo.calcConversionRate(hospitalId, start, end);
        List<ReportSummaryResponse.ProcedureStat> top = repo.findTopProcedures(hospitalId, start, end);

        return new ReportSummaryResponse(periodLabel, newPatients, consultations, bookings, conversion, top);
    }

    private LocalDateTime[] parsePeriodRange(String period) {
        if (period == null || period.isBlank()) return null;
        if (period.matches("\\d{4}-\\d{2}")) {
            YearMonth ym = YearMonth.parse(period);
            return new LocalDateTime[]{ym.atDay(1).atStartOfDay(), ym.atEndOfMonth().atTime(23, 59, 59)};
        }
        if (period.matches("\\d{4}-Q[1-4]")) {
            int year    = Integer.parseInt(period.substring(0, 4));
            int quarter = Integer.parseInt(period.substring(6));
            Month startMonth = Month.of((quarter - 1) * 3 + 1);
            YearMonth startYm = YearMonth.of(year, startMonth);
            YearMonth endYm   = startYm.plusMonths(2);
            return new LocalDateTime[]{startYm.atDay(1).atStartOfDay(), endYm.atEndOfMonth().atTime(23, 59, 59)};
        }
        return null;
    }
}
