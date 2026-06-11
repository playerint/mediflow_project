package io.mediflow.core.hospitalbo.settings.controller;

import io.mediflow.core.hospitalbo.settings.dto.HospitalSettingsDto;
import io.mediflow.core.hospitalbo.settings.service.HospitalSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 병원 운영자(hospital-bo) — 병원 설정 API.
 * JWT 인증은 SecurityConfig + JwtAuthFilter 에서 공통 처리.
 */
@RestController
@RequestMapping("/api/v1/hospital/settings")
@RequiredArgsConstructor
public class HospitalSettingsController {

    private final HospitalSettingsService settingsService;

    /**
     * GET /api/v1/hospital/settings
     * 병원 운영 설정 조회.
     */
    @GetMapping
    public ResponseEntity<HospitalSettingsDto> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    /**
     * PUT /api/v1/hospital/settings
     * 병원 운영 설정 저장.
     */
    @PutMapping
    public ResponseEntity<HospitalSettingsDto> saveSettings(
            @RequestBody HospitalSettingsDto request) {
        return ResponseEntity.ok(settingsService.saveSettings(request));
    }
}
