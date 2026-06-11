package io.mediflow.core.hospitalbo.settings.service;

import io.mediflow.core.common.tenant.TenantContext;
import io.mediflow.core.hospitalbo.settings.dto.HospitalSettingsDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 병원 설정 서비스.
 *
 * 현재는 인메모리 맵(hospitalId → 설정)으로 동작한다.
 * 서버 재시작 시 데이터가 초기화되므로 임시 구현임을 인지할 것.
 *
 * 추후 플랫폼 DB의 hospital_settings 테이블로 교체 예정.
 * (설정은 환자 데이터가 아니므로 플랫폼 DB에 저장해도 법적으로 무관함)
 */
@Service
public class HospitalSettingsService {

    /** hospitalId → 저장된 설정 (임시 인메모리 저장소) */
    private final Map<Long, HospitalSettingsDto> settingsStore = new ConcurrentHashMap<>();

    private Long requireHospitalId() {
        Long id = TenantContext.getHospitalId();
        if (id == null) throw new SecurityException("병원 인증이 필요합니다.");
        return id;
    }

    /**
     * 병원 설정 조회.
     * 저장된 설정이 없으면 기본값을 반환한다.
     */
    public HospitalSettingsDto getSettings() {
        Long hospitalId = requireHospitalId();
        return settingsStore.getOrDefault(hospitalId, defaultSettings());
    }

    /**
     * 병원 설정 저장.
     * 기존 설정이 있으면 덮어쓴다.
     */
    public HospitalSettingsDto saveSettings(HospitalSettingsDto request) {
        Long hospitalId = requireHospitalId();
        settingsStore.put(hospitalId, request);
        return request;
    }

    /** 기본 설정값 */
    private HospitalSettingsDto defaultSettings() {
        return new HospitalSettingsDto(
                "09:00-18:00",
                "12:00-13:00",
                List.of("일요일"),
                "admin@hospital.com",
                true
        );
    }
}
