package io.mediflow.core.hospitaldb.repository;

import io.mediflow.core.hospitaldb.dto.BookingDto;
import io.mediflow.core.hospitaldb.dto.ConsultationDto;
import io.mediflow.core.hospitaldb.dto.PatientDto;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

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

    public List<ConsultationDto> findConsultations(Long hospitalId, String status) {
        String s = schema(hospitalId);
        String where = (status != null && !status.isBlank()) ? " AND c.status = ?" : "";
        String sql = """
            SELECT c.*, p.name_ja AS patient_name_ja
            FROM   %s.consultations c
            JOIN   %s.patients      p ON c.patient_id = p.id
            WHERE  1=1 %s
            ORDER  BY c.created_at DESC
            """.formatted(s, s, where);

        if (status != null && !status.isBlank()) {
            return jdbc.query(sql, (rs, rowNum) -> mapConsultation(rs), status);
        }
        return jdbc.query(sql, (rs, rowNum) -> mapConsultation(rs));
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
