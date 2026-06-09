package io.mediflow.core.hospital.controller;

import io.mediflow.core.hospital.dto.HospitalCreateRequest;
import io.mediflow.core.hospital.dto.HospitalResponse;
import io.mediflow.core.hospital.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 병원 관리 API — 본사용 BO(platform-bo) 에서 호출
 * Base URL: /api/v1/hospitals
 *
 * 병원용 BO(hospital-bo) 는 자신의 병원 ID 한 건만 조회할 수 있으며,
 * TenantInterceptor + TenantContext 가 hospital_id 격리를 보장한다.
 */
@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    /** GET /api/v1/hospitals — 전체 목록 (본사 권한) */
    @GetMapping
    public ResponseEntity<List<HospitalResponse>> getAll(
            @RequestParam(required = false) String status
    ) {
        List<HospitalResponse> list = status != null
                ? hospitalService.findByStatus(status)
                : hospitalService.findAll();
        return ResponseEntity.ok(list);
    }

    /** GET /api/v1/hospitals/{id} — 단건 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<HospitalResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalService.findById(id));
    }

    /** POST /api/v1/hospitals — 병원 등록 */
    @PostMapping
    public ResponseEntity<HospitalResponse> create(
            @Valid @RequestBody HospitalCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hospitalService.create(request));
    }
}
