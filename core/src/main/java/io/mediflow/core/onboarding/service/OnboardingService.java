package io.mediflow.core.onboarding.service;

import io.mediflow.core.common.client.AiServiceClient;
import io.mediflow.core.common.exception.ResourceNotFoundException;
import io.mediflow.core.onboarding.dto.AnalyzeResultDto;
import io.mediflow.core.onboarding.dto.ComplianceCheckResultDto;
import io.mediflow.core.onboarding.dto.OnboardingResponse;
import io.mediflow.core.onboarding.entity.Onboarding;
import io.mediflow.core.onboarding.repository.OnboardingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OnboardingService {

    private final OnboardingRepository onboardingRepository;
    private final AiServiceClient      aiServiceClient;

    /** 진행 중인 온보딩 전체 목록 (본사 대시보드용) */
    public List<OnboardingResponse> findInProgress() {
        return onboardingRepository.findByStatus("IN_PROGRESS")
                .stream()
                .map(OnboardingResponse::from)
                .toList();
    }

    /** 특정 병원의 온보딩 조회 */
    public OnboardingResponse findByHospitalId(Long hospitalId) {
        Onboarding o = onboardingRepository.findByHospitalId(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "온보딩 정보를 찾을 수 없습니다. hospitalId=" + hospitalId));
        return OnboardingResponse.from(o);
    }

    /** 병원 등록 시 온보딩 레코드 생성 */
    @Transactional
    public OnboardingResponse create(Long hospitalId) {
        Onboarding o = Onboarding.builder()
                .hospitalId(hospitalId)
                .build();
        return OnboardingResponse.from(onboardingRepository.save(o));
    }

    /** 단계 완료 → 다음 단계로 이동 */
    @Transactional
    public OnboardingResponse completeStep(Long hospitalId) {
        Onboarding o = getOnboarding(hospitalId);
        o.advanceStep();
        return OnboardingResponse.from(onboardingRepository.save(o));
    }

    /** 온보딩 최종 완료 처리 (환자용 사이트 URL 생성 포함) */
    @Transactional
    public OnboardingResponse publish(Long hospitalId, String siteUrl) {
        Onboarding o = getOnboarding(hospitalId);
        o.complete(siteUrl);
        return OnboardingResponse.from(onboardingRepository.save(o));
    }

    /** Step 1 — ai-service에 분석 요청 후 결과를 DB에 저장하고 반환 */
    @Transactional
    public AnalyzeResultDto analyze(Long hospitalId, String url) {
        AnalyzeResultDto result = aiServiceClient.analyze(hospitalId, url);

        // 분석 결과를 온보딩 레코드에 저장 (간단한 JSON 문자열로)
        Onboarding o = getOnboarding(hospitalId);
        String json = String.format(
                "{\"step1\":{\"clinicType\":\"%s\",\"specialties\":%s}}",
                result.clinicType(),
                result.specialties().stream()
                        .collect(java.util.stream.Collectors.joining("\",\"", "[\"", "\"]"))
        );
        o.saveStepData(json);
        onboardingRepository.save(o);

        return result;
    }

    /** Step 6 — 콘텐츠를 ai-service에 보내 의료 광고법 위반 여부를 검사한다 */
    public ComplianceCheckResultDto checkCompliance(Long hospitalId, String content) {
        return aiServiceClient.checkCompliance(hospitalId, content);
    }

    private Onboarding getOnboarding(Long hospitalId) {
        return onboardingRepository.findByHospitalId(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "온보딩 정보를 찾을 수 없습니다. hospitalId=" + hospitalId));
    }
}
