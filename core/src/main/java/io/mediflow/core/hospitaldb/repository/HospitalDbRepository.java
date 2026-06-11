package io.mediflow.core.hospitaldb.repository;

import io.mediflow.core.hospitalbo.marketing.dto.MarketingStatsResponse;
import io.mediflow.core.hospitalbo.reports.dto.ReportSummaryResponse;
import io.mediflow.core.hospitaldb.dto.BookingDto;
import io.mediflow.core.hospitaldb.dto.ConsultationDto;
import io.mediflow.core.hospitaldb.dto.PatientDto;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 병원별 스키마(hospital_N)에 대한 JDBC 기반 조회.
 *
 * hospitalId는 반드시 TenantContext(=JWT)에서 가져온다.
 * 직접 외부 입력을 사용하지 않아 SQL Injection 없음.
 */
@Repository
@RequiredArgsConstructor
public class HospitalDbRepository {

    private final JdbcTemplate jdbc;

    private String schema(Long hospitalId) {
        return "hospital_" + hospitalId;
    }

    // ── 환자 ─────────────────────────────────────────────────────

    public List<PatientDto> findPatients(Long hospitalId) {
        String s = schema(hospitalId);
        return jdbc.query(
                "SELECT * FROM " + s + ".patients ORDER BY created_at DESC",
                (rs, rowNum) -> new PatientDto(
                        rs.getLong("id"),
                        rs.getString("name_ja"),
                        rs.getString("name_ko"),
                        rs.getString("email"),
                        rs.getString("phone"),
                        rs.getObject("age", Integer.class),
                        rs.getString("gender"),
                        rs.getString("country"),
                        rs.getString("preferred_treatment"),
                        rs.getString("status"),
                        rs.getTimestamp("created_at") != null
                                ? rs.getTimestamp("created_at").toLocalDateTime() : null
                ));
    }

    // ── 상담 문의 ─────────────────────────────────────────────────

    public List<ConsultationDto> findConsultations(Long hospitalId, String status, String channel) {
        String s = schema(hospitalId);
        String whereStatus  = (status  != null && !status.isBlank())  ? " AND c.status = ?"  : "";
        String whereChannel = (channel != null && !channel.isBlank()) ? " AND c.channel = ?" : "";
        String sql = """
            SELECT c.*, p.name_ja AS patient_name_ja
            FROM   %s.consultations c
            JOIN   %s.patients      p ON c.patient_id = p.id
            WHERE  1=1 %s %s
            ORDER  BY c.created_at DESC
            """.formatted(s, s, whereStatus, whereChannel);

        boolean hasStatus  = status  != null && !status.isBlank();
        boolean hasChannel = channel != null && !channel.isBlank();

        if (hasStatus && hasChannel) return jdbc.query(sql, (rs, r) -> mapConsultation(rs), status, channel);
        if (hasStatus)               return jdbc.query(sql, (rs, r) -> mapConsultation(rs), status);
        if (hasChannel)              return jdbc.query(sql, (rs, r) -> mapConsultation(rs), channel);
        return jdbc.query(sql, (rs, r) -> mapConsultation(rs));
    }

    public int countByStatus(Long hospitalId, String status) {
        String s = schema(hospitalId);
        Integer n = jdbc.queryForObject(
                "SELECT COUNT(*) FROM " + s + ".consultations WHERE status = ?",
                Integer.class, status);
        return n != null ? n : 0;
    }

    public int updateConsultationStatus(Long hospitalId, Long consultationId, String newStatus) {
        String s = schema(hospitalId);
        return jdbc.update(
                "UPDATE " + s + ".consultations SET status = ?, replied_at = CASE WHEN ? = 'replied' THEN NOW() ELSE replied_at END WHERE id = ?",
                newStatus, newStatus, consultationId);
    }

    // ── 예약 ─────────────────────────────────────────────────────

    public List<BookingDto> findBookings(Long hospitalId) {
        String s = schema(hospitalId);
        return jdbc.query("""
            SELECT b.*, p.name_ja AS patient_name_ja
            FROM   %s.bookings b
            JOIN   %s.patients p ON b.patient_id = p.id
            ORDER  BY b.scheduled_at ASC
            """.formatted(s, s),
                (rs, rowNum) -> new BookingDto(
                        rs.getLong("id"),
                        rs.getLong("patient_id"),
                        rs.getString("patient_name_ja"),
                        rs.getString("treatment"),
                        rs.getString("doctor"),
                        rs.getTimestamp("scheduled_at") != null
                                ? rs.getTimestamp("scheduled_at").toLocalDateTime() : null,
                        rs.getString("status"),
                        rs.getString("notes"),
                        rs.getTimestamp("created_at") != null
                                ? rs.getTimestamp("created_at").toLocalDateTime() : null
                ));
    }

    // ── 리포트 집계 ───────────────────────────────────────────────

    private static final LocalDateTime EPOCH_START = LocalDateTime.of(1970, 1, 1, 0, 0);
    private static final LocalDateTime FAR_FUTURE  = LocalDateTime.of(2099, 12, 31, 23, 59);

    private LocalDateTime from(LocalDateTime start) { return start != null ? start : EPOCH_START; }
    private LocalDateTime to(LocalDateTime end)     { return end   != null ? end   : FAR_FUTURE;  }

    public int countPatients(Long hospitalId, LocalDateTime start, LocalDateTime end) {
        String s = schema(hospitalId);
        Integer n = jdbc.queryForObject(
                "SELECT COUNT(*) FROM " + s + ".patients WHERE created_at >= ? AND created_at <= ?",
                Integer.class, from(start), to(end));
        return n != null ? n : 0;
    }

    public int countConsultationsRange(Long hospitalId, LocalDateTime start, LocalDateTime end) {
        String s = schema(hospitalId);
        Integer n = jdbc.queryForObject(
                "SELECT COUNT(*) FROM " + s + ".consultations WHERE created_at >= ? AND created_at <= ?",
                Integer.class, from(start), to(end));
        return n != null ? n : 0;
    }

    public int countBookingsRange(Long hospitalId, LocalDateTime start, LocalDateTime end) {
        String s = schema(hospitalId);
        Integer n = jdbc.queryForObject(
                "SELECT COUNT(*) FROM " + s + ".bookings WHERE created_at >= ? AND created_at <= ?",
                Integer.class, from(start), to(end));
        return n != null ? n : 0;
    }

    public double calcConversionRate(Long hospitalId, LocalDateTime start, LocalDateTime end) {
        String s = schema(hospitalId);
        Double rate = jdbc.queryForObject(
                "SELECT COUNT(*) FILTER (WHERE status = 'replied') * 100.0 / NULLIF(COUNT(*), 0)" +
                " FROM " + s + ".consultations WHERE created_at >= ? AND created_at <= ?",
                Double.class, from(start), to(end));
        return rate != null ? Math.round(rate * 10.0) / 10.0 : 0.0;
    }

    public List<ReportSummaryResponse.ProcedureStat> findTopProcedures(Long hospitalId, LocalDateTime start, LocalDateTime end) {
        String s = schema(hospitalId);
        return jdbc.query(
                "SELECT preferred_treatment AS name, COUNT(*) AS cnt" +
                " FROM " + s + ".patients" +
                " WHERE preferred_treatment IS NOT NULL AND created_at >= ? AND created_at <= ?" +
                " GROUP BY preferred_treatment ORDER BY cnt DESC LIMIT 5",
                (rs, r) -> new ReportSummaryResponse.ProcedureStat(rs.getString("name"), rs.getInt("cnt")),
                from(start), to(end));
    }

    // ── 마케팅 집계 ───────────────────────────────────────────────

    public List<MarketingStatsResponse.ChannelStat> countByChannel(Long hospitalId, LocalDateTime start, LocalDateTime end) {
        String s = schema(hospitalId);
        List<MarketingStatsResponse.ChannelStat> raw = jdbc.query(
                "SELECT channel, COUNT(*) AS leads FROM " + s + ".consultations" +
                " WHERE created_at >= ? AND created_at <= ?" +
                " GROUP BY channel ORDER BY leads DESC",
                (rs, r) -> new MarketingStatsResponse.ChannelStat(rs.getString("channel"), rs.getInt("leads"), 0.0),
                from(start), to(end));
        int total = raw.stream().mapToInt(MarketingStatsResponse.ChannelStat::leads).sum();
        if (total == 0) return raw;
        return raw.stream()
                .map(c -> new MarketingStatsResponse.ChannelStat(
                        c.name(), c.leads(), Math.round(c.leads() * 1000.0 / total) / 10.0))
                .toList();
    }

    public List<MarketingStatsResponse.MonthlyTrend> countMonthlyTrend(Long hospitalId, int months) {
        String s = schema(hospitalId);
        return jdbc.query(
                "SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month, COUNT(*) AS leads" +
                " FROM " + s + ".consultations" +
                " WHERE created_at >= NOW() - INTERVAL '" + months + " months'" +
                " GROUP BY DATE_TRUNC('month', created_at) ORDER BY month ASC",
                (rs, r) -> new MarketingStatsResponse.MonthlyTrend(rs.getString("month"), rs.getInt("leads")));
    }

    // ── 매핑 헬퍼 ────────────────────────────────────────────────

    private ConsultationDto mapConsultation(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new ConsultationDto(
                rs.getLong("id"),
                rs.getLong("patient_id"),
                rs.getString("patient_name_ja"),
                rs.getString("channel"),
                rs.getString("treatment"),
                rs.getString("message"),
                rs.getString("status"),
                rs.getString("assigned_to"),
                rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null,
                rs.getTimestamp("replied_at") != null ? rs.getTimestamp("replied_at").toLocalDateTime() : null
        );
    }
}
