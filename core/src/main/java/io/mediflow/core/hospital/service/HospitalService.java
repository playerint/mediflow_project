package io.mediflow.core.hospital.service;

import io.mediflow.core.common.exception.ResourceNotFoundException;
import io.mediflow.core.hospital.dto.HospitalCreateRequest;
import io.mediflow.core.hospital.dto.HospitalResponse;
import io.mediflow.core.hospital.entity.Hospital;
import io.mediflow.core.hospital.repository.HospitalRepository;
import io.mediflow.core.onboarding.service.OnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final OnboardingService  onboardingService;

    /** 전체 병원 목록 (본사 권한 전용) */
    public List<HospitalResponse> findAll() {
        return hospitalRepository.findAll()
                .stream()
                .map(HospitalResponse::from)
                .toList();
    }

    /** 상태별 필터 목록 */
    public List<HospitalResponse> findByStatus(String status) {
        return hospitalRepository.findByStatus(status)
                .stream()
                .map(HospitalResponse::from)
                .toList();
    }

    /** 단건 조회 */
    public HospitalResponse findById(Long id) {
        Hospital h = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("병원을 찾을 수 없습니다. id=" + id));
        return HospitalResponse.from(h);
    }

    /** 병원 등록 (온보딩 시작) */
    @Transactional
    public HospitalResponse create(HospitalCreateRequest req) {
        Hospital h = Hospital.builder()
                .nameKr(req.getNameKr())
                .nameJa(req.getNameJa())
                .clinicType(req.getClinicType())
                .specialty(req.getSpecialty())
                .plan(req.getPlan())
                .status("onboarding")
                .managerName(req.getManagerName())
                .managerEmail(req.getManagerEmail())
                .contractStart(req.getContractStart())
                .contractExpire(req.getContractExpire())
                .build();
        Hospital saved = hospitalRepository.save(h);
        onboardingService.create(saved.getId());   // 온보딩 레코드 자동 생성
        return HospitalResponse.from(saved);
    }
}
