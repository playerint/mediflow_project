package io.mediflow.core.hospitaldb.controller;

import io.mediflow.core.hospitaldb.dto.BookingDto;
import io.mediflow.core.hospitaldb.dto.ConsultationDto;
import io.mediflow.core.hospitaldb.dto.PatientDto;
import io.mediflow.core.hospitaldb.service.HospitalDbService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 병원 운영자(hospital-bo)가 호출하는 환자·상담·예약 API.
 * JWT에 hospitalId가 있는 병원 계정만 접근 가능.
 * TenantContext가 항상 자기 병원 스키마만 바라보도록 보장.
 */
@RestController
@RequestMapping("/api/v1/hospital")
@RequiredArgsConstructor
public class HospitalDbController {

    private final HospitalDbService service;

    // ── 환자 ─────────────────────────────────────────────────────

    /** GET /api/v1/hospital/patients */
    @GetMapping("/patients")
    public ResponseEntity<List<PatientDto>> getPatients() {
        return ResponseEntity.ok(service.getPatients());
    }

    // ── 상담 문의 ─────────────────────────────────────────────────

    /** GET /api/v1/hospital/consultations?status=new&channel=LINE */
    @GetMapping("/consultations")
    public ResponseEntity<List<ConsultationDto>> getConsultations(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String channel) {
        return ResponseEntity.ok(service.getConsultations(status, channel));
    }

    /** GET /api/v1/hospital/consultations/stats */
    @GetMapping("/consultations/stats")
    public ResponseEntity<Map<String, Integer>> getConsultationStats() {
        return ResponseEntity.ok(service.getConsultationStats());
    }

    /** PATCH /api/v1/hospital/consultations/{id}/status */
    @PatchMapping("/consultations/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        service.updateConsultationStatus(id, body.getOrDefault("status", "new"));
        return ResponseEntity.ok().build();
    }

    // ── 예약 ─────────────────────────────────────────────────────

    /** GET /api/v1/hospital/bookings */
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDto>> getBookings() {
        return ResponseEntity.ok(service.getBookings());
    }
}
