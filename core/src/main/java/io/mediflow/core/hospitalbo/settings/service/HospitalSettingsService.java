package io.mediflow.core.hospitalbo.settings.service;

import io.mediflow.core.common.tenant.TenantContext;
import io.mediflow.core.hospitalbo.settings.dto.HospitalSettingsDto;
import io.mediflow.core.hospitalbo.settings.entity.HospitalSettings;
import io.mediflow.core.hospitalbo.settings.repository.HospitalSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 병원 설정 서비스.
 *
 * 플랫폼 DB의 hospital_settings 테이블에 영속한다.
 * 서버 재시작 후에도 설정이 유지된다.
 *
 * closedDays 는 DB에 CSV 문자열로 저장하고, DTO에서는 List<String> 으로 노출한다.
 * (예: "일요일,공휴일" ↔ ["일요일", "공휴일"])
 */
@Service
@RequiredArgsConstructor
public class HospitalSettingsService {

    private final HospitalSettingsRepository settingsRepository;

    private Long requireHospitalId() {
        Long id = TenantContext.getHospitalId();
        if (id == null) throw new SecurityException("병원 인증이 필요합니다.");
        return id;
    }

    /**
     * 병원 설정 조회.
     * DB에 저장된 설정이 없으면 기본값 DTO를 반환한다(저장은 하지 않음).
     */
    @Transactional(readOnly = true)
    public HospitalSettingsDto getSettings() {
        Long hospitalId = requireHospitalId();
        return settingsRepository.findByHospitalId(hospitalId)
                .map(this::toDto)
                .orElseGet(this::defaultSettings);
    }

    /**
     * 병원 설정 저장.
     * 기존 행이 있으면 UPDATE, 없으면 INSERT(upsert).
     */
    @Transactional
    public HospitalSettingsDto saveSettings(HospitalSettingsDto request) {
        Long hospitalId = requireHospitalId();
        String closedDaysCsv = toCsv(request.closedDays());

        HospitalSettings entity = settingsRepository.findByHospitalId(hospitalId)
                .orElseGet(() -> HospitalSettings.builder()
                        .hospitalId(hospitalId)
                        .build());

        entity.update(
                request.businessHours(),
                request.lunchBreak(),
                closedDaysCsv,
                request.notificationEmail(),
                request.autoReplyEnabled()
        );

        settingsRepository.save(entity);
        return toDto(entity);
    }

    // ── 변환 헬퍼 ────────────────────────────────────────────────────────

    private HospitalSettingsDto toDto(HospitalSettings entity) {
        List<String> closedDays = fromCsv(entity.getClosedDays());
        return new HospitalSettingsDto(
                entity.getBusinessHours(),
                entity.getLunchBreak(),
                closedDays,
                entity.getNotificationEmail(),
                entity.isAutoReplyEnabled()
        );
    }

    private HospitalSettingsDto defaultSettings() {
        return new HospitalSettingsDto(
                "09:00-18:00",
                "12:00-13:00",
                List.of("일요일"),
                "admin@hospital.com",
                true
        );
    }

    /** List<String> → CSV 문자열 (null-safe) */
    private String toCsv(List<String> list) {
        if (list == null || list.isEmpty()) return "";
        return list.stream()
                .map(String::trim)
                .collect(Collectors.joining(","));
    }

    /** CSV 문자열 → List<String> (null-safe) */
    private List<String> fromCsv(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
