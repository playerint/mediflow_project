package io.mediflow.core.onboarding.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mediflow.core.common.client.AiServiceClient;
import io.mediflow.core.common.exception.ResourceNotFoundException;
import io.mediflow.core.onboarding.dto.AnalyzeResultDto;
import io.mediflow.core.onboarding.dto.ComplianceCheckResultDto;
import io.mediflow.core.onboarding.dto.OnboardingResponse;
import io.mediflow.core.onboarding.dto.StepDataResponse;
import io.mediflow.core.onboarding.entity.Onboarding;
import io.mediflow.core.onboarding.entity.OnboardingStepData;
import io.mediflow.core.onboarding.repository.OnboardingRepository;
import io.mediflow.core.onboarding.repository.OnboardingStepDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OnboardingService {

    private final OnboardingRepository         onboardingRepository;
    private final OnboardingStepDataRepository stepDataRepository;
    private final AiServiceClient              aiServiceClient;
    private final ObjectMapper                 objectMapper;

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

    /** Step 1 — ai-service에 분석 요청 후 결과를 onboarding_step_data에 저장하고 반환 */
    @Transactional
    public AnalyzeResultDto analyze(Long hospitalId, String url) {
        AnalyzeResultDto result = aiServiceClient.analyze(hospitalId, url);

        try {
            String json = objectMapper.writeValueAsString(result);
            saveStepData(hospitalId, 1, json, true);
        } catch (Exception ignored) {
            // JSON 직렬화 실패 시 분석 결과는 그대로 반환
        }

        return result;
    }

    /** Step 6 — 콘텐츠를 ai-service에 보내 의료 광고법 위반 여부를 검사한다 */
    public ComplianceCheckResultDto checkCompliance(Long hospitalId, String content) {
        return aiServiceClient.checkCompliance(hospitalId, content);
    }

    /** 단계 데이터 저장 (없으면 생성, 있으면 덮어쓰기) */
    @Transactional
    public StepDataResponse saveStepData(Long hospitalId, int stepNumber, String data, boolean complete) {
        OnboardingStepData stepData = stepDataRepository
                .findByHospitalIdAndStepNumber(hospitalId, stepNumber)
                .orElseGet(() -> OnboardingStepData.builder()
                        .hospitalId(hospitalId)
                        .stepNumber(stepNumber)
                        .build());
        stepData.updateData(data, complete);
        return StepDataResponse.from(stepDataRepository.save(stepData));
    }

    /** 특정 단계 데이터 조회 */
    public StepDataResponse getStepData(Long hospitalId, int stepNumber) {
        return stepDataRepository
                .findByHospitalIdAndStepNumber(hospitalId, stepNumber)
                .map(StepDataResponse::from)
                .orElse(null);
    }

    /** 해당 병원의 모든 단계 데이터 조회 */
    public Map<Integer, StepDataResponse> getAllStepData(Long hospitalId) {
        return stepDataRepository
                .findByHospitalIdOrderByStepNumber(hospitalId)
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        OnboardingStepData::getStepNumber,
                        StepDataResponse::from
                ));
    }

    private Onboarding getOnboarding(Long hospitalId) {
        return onboardingRepository.findByHospitalId(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "온보딩 정보를 찾을 수 없습니다. hospitalId=" + hospitalId));
    }
}
