package io.mediflow.core.onboarding.repository;

import io.mediflow.core.onboarding.entity.Onboarding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OnboardingRepository extends JpaRepository<Onboarding, Long> {

    /** 병원 ID로 온보딩 조회 (1:1 관계) */
    Optional<Onboarding> findByHospitalId(Long hospitalId);

    /** 상태별 온보딩 목록 (본사 대시보드용) */
    List<Onboarding> findByStatus(String status);

    /** 현재 단계별 온보딩 목록 */
    List<Onboarding> findByCurrentStep(int step);
}
