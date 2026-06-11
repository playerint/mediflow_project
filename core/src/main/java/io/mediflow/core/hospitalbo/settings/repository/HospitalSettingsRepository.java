package io.mediflow.core.hospitalbo.settings.repository;

import io.mediflow.core.hospitalbo.settings.entity.HospitalSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * hospital_settings 테이블 JPA 리포지토리.
 *
 * hospital_id 는 UNIQUE 이므로 findByHospitalId 는 항상 0~1개를 반환한다.
 */
public interface HospitalSettingsRepository extends JpaRepository<HospitalSettings, Long> {

    /** hospitalId 로 설정 조회. 아직 저장된 설정이 없으면 빈 Optional. */
    Optional<HospitalSettings> findByHospitalId(Long hospitalId);
}
