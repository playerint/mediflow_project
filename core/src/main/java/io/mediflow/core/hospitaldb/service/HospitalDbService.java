package io.mediflow.core.hospitaldb.service;

import io.mediflow.core.common.tenant.TenantContext;
import io.mediflow.core.hospitaldb.dto.BookingDto;
import io.mediflow.core.hospitaldb.dto.ConsultationDto;
import io.mediflow.core.hospitaldb.dto.PatientDto;
import io.mediflow.core.hospitaldb.repository.HospitalDbRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HospitalDbService {

    private final HospitalDbRepository repo;

    private Long requireHospitalId() {
        Long id = TenantContext.getHospitalId();
        if (id == null) throw new SecurityException("병원 인증이 필요합니다.");
        return id;
    }

    // ── 환자 ─────────────────────────────────────────────────────

    public List<PatientDto> getPatients() {
        return repo.findPatients(requireHospitalId());
    }

    // ── 상담 ─────────────────────────────────────────────────────

    public List<ConsultationDto> getConsultations(String status, String channel) {
        return repo.findConsultations(requireHospitalId(), status, channel);
    }

    public Map<String, Integer> getConsultationStats() {
        Long id = requireHospitalId();
        return Map.of(
                "new",     repo.countByStatus(id, "new"),
                "pending", repo.countByStatus(id, "pending"),
                "replied", repo.countByStatus(id, "replied")
        );
    }

    public void updateConsultationStatus(Long consultationId, String newStatus) {
        repo.updateConsultationStatus(requireHospitalId(), consultationId, newStatus);
    }

    // ── 예약 ─────────────────────────────────────────────────────

    public List<BookingDto> getBookings() {
        return repo.findBookings(requireHospitalId());
    }
}
