package io.mediflow.core.onboarding.controller;

import io.mediflow.core.onboarding.dto.AnalyzeResultDto;
import io.mediflow.core.onboarding.dto.ComplianceCheckResultDto;
import io.mediflow.core.onboarding.dto.OnboardingResponse;
import io.mediflow.core.onboarding.dto.StepDataResponse;
import io.mediflow.core.onboarding.service.OnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 온보딩 관리 API — platform-bo 에서 호출
 * Base URL: /api/v1/onboarding
 */
@RestController
@RequestMapping("/api/v1/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;

    /** GET /api/v1/onboarding — 진행 중인 온보딩 전체 목록 */
    @GetMapping
    public ResponseEntity<List<OnboardingResponse>> getInProgress() {
        return ResponseEntity.ok(onboardingService.findInProgress());
    }

    /** GET /api/v1/onboarding/hospitals/{hospitalId} — 특정 병원 온보딩 조회 */
    @GetMapping("/hospitals/{hospitalId}")
    public ResponseEntity<OnboardingResponse> getByHospital(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(onboardingService.findByHospitalId(hospitalId));
    }

    /**
     * POST /api/v1/onboarding/hospitals/{hospitalId}/next
     * 현재 단계 완료 → 다음 단계로 진행
     */
    @PostMapping("/hospitals/{hospitalId}/next")
    public ResponseEntity<OnboardingResponse> nextStep(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(onboardingService.completeStep(hospitalId));
    }

    /**
     * POST /api/v1/onboarding/hospitals/{hospitalId}/analyze
     * Step 1 — 병원 URL을 ai-service에 전달해 자동 분석 결과를 반환
     * Body: { "url": "https://example.co.kr" }
     */
    @PostMapping("/hospitals/{hospitalId}/analyze")
    public ResponseEntity<AnalyzeResultDto> analyze(
            @PathVariable Long hospitalId,
            @RequestBody java.util.Map<String, String> body
    ) {
        String url = body.getOrDefault("url", "");
        return ResponseEntity.ok(onboardingService.analyze(hospitalId, url));
    }

    /**
     * POST /api/v1/onboarding/hospitals/{hospitalId}/compliance
     * Step 6 — 일본어 콘텐츠를 ai-service에 전달해 의료 광고법 위반 여부를 검사
     * Body: { "content": "..."  }
     */
    @PostMapping("/hospitals/{hospitalId}/compliance")
    public ResponseEntity<ComplianceCheckResultDto> checkCompliance(
            @PathVariable Long hospitalId,
            @RequestBody java.util.Map<String, String> body
    ) {
        String content = body.getOrDefault("content", "");
        return ResponseEntity.ok(onboardingService.checkCompliance(hospitalId, content));
    }

    /**
     * POST /api/v1/onboarding/hospitals/{hospitalId}/publish
     * 온보딩 최종 완료 + 환자용 사이트 게시
     * Body: { "siteUrl": "jp.example.co.kr" }
     */
    @PostMapping("/hospitals/{hospitalId}/publish")
    public ResponseEntity<OnboardingResponse> publish(
            @PathVariable Long hospitalId,
            @RequestBody java.util.Map<String, String> body
    ) {
        String siteUrl = body.getOrDefault("siteUrl", "");
        return ResponseEntity.ok(onboardingService.publish(hospitalId, siteUrl));
    }

    /**
     * PUT /api/v1/onboarding/hospitals/{hospitalId}/steps/{stepNumber}
     * 특정 단계 데이터 저장 (없으면 생성, 있으면 덮어쓰기)
     * Body: { "data": "{...}", "complete": true }
     */
    @PutMapping("/hospitals/{hospitalId}/steps/{stepNumber}")
    public ResponseEntity<StepDataResponse> saveStepData(
            @PathVariable Long hospitalId,
            @PathVariable int stepNumber,
            @RequestBody Map<String, Object> body
    ) {
        String data = (String) body.getOrDefault("data", "{}");
        boolean complete = Boolean.TRUE.equals(body.get("complete"));
        return ResponseEntity.ok(onboardingService.saveStepData(hospitalId, stepNumber, data, complete));
    }

    /**
     * GET /api/v1/onboarding/hospitals/{hospitalId}/steps/{stepNumber}
     * 특정 단계 데이터 조회
     */
    @GetMapping("/hospitals/{hospitalId}/steps/{stepNumber}")
    public ResponseEntity<StepDataResponse> getStepData(
            @PathVariable Long hospitalId,
            @PathVariable int stepNumber
    ) {
        StepDataResponse result = onboardingService.getStepData(hospitalId, stepNumber);
        if (result == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/v1/onboarding/hospitals/{hospitalId}/steps
     * 해당 병원의 모든 단계 데이터 한 번에 조회
     */
    @GetMapping("/hospitals/{hospitalId}/steps")
    public ResponseEntity<Map<Integer, StepDataResponse>> getAllStepData(
            @PathVariable Long hospitalId
    ) {
        return ResponseEntity.ok(onboardingService.getAllStepData(hospitalId));
    }
}
