package io.mediflow.core.onboarding.repository;

import io.mediflow.core.onboarding.entity.OnboardingStepData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OnboardingStepDataRepository extends JpaRepository<OnboardingStepData, Long> {

    /** 특정 병원의 특정 단계 데이터 조회 */
    Optional<OnboardingStepData> findByHospitalIdAndStepNumber(Long hospitalId, int stepNumber);

    /** 특정 병원의 모든 단계 데이터 조회 (단계 순서대로) */
    List<OnboardingStepData> findByHospitalIdOrderByStepNumber(Long hospitalId);
}
