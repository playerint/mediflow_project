package io.mediflow.core.site.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mediflow.core.hospital.dto.HospitalResponse;
import io.mediflow.core.hospital.service.HospitalService;
import io.mediflow.core.onboarding.dto.StepDataResponse;
import io.mediflow.core.onboarding.service.OnboardingService;
import io.mediflow.core.site.dto.PublicSiteResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * patient-fo 전용 공개 API (토큰 불필요)
 * SecurityConfig에서 GET /api/v1/public/** 을 permitAll 처리
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicSiteController {

    private final HospitalService  hospitalService;
    private final OnboardingService onboardingService;
    private final ObjectMapper     objectMapper;

    /**
     * GET /api/v1/public/sites/{hospitalId}
     * 병원 기본 정보 + 온보딩 Step 1(시술) + Step 5(일본어 카피) 통합 반환
     */
    @GetMapping("/sites/{hospitalId}")
    public ResponseEntity<PublicSiteResponse> getSiteData(@PathVariable Long hospitalId) {
        HospitalResponse hospital = hospitalService.findById(hospitalId);

        List<String> specialties         = List.of();
        List<String> suggestedKeywordsJa = List.of();
        String       japaneseCopy        = "";

        // Step 1 — 분석 결과 (specialties, suggestedKeywordsJa)
        StepDataResponse step1 = onboardingService.getStepData(hospitalId, 1);
        if (step1 != null && step1.data() != null) {
            try {
                Map<String, Object> d = objectMapper.readValue(
                        step1.data(), new TypeReference<>() {});
                Object sp = d.get("specialties");
                if (sp instanceof List<?> list) {
                    specialties = list.stream()
                            .filter(String.class::isInstance)
                            .map(String.class::cast)
                            .toList();
                }
                Object kw = d.get("suggestedKeywordsJa");
                if (kw instanceof List<?> list) {
                    suggestedKeywordsJa = list.stream()
                            .filter(String.class::isInstance)
                            .map(String.class::cast)
                            .toList();
                }
            } catch (Exception e) {
                log.warn("Step 1 데이터 파싱 실패 hospitalId={}", hospitalId, e);
            }
        }

        // Step 5 — 일본어 카피
        StepDataResponse step5 = onboardingService.getStepData(hospitalId, 5);
        if (step5 != null && step5.data() != null) {
            try {
                Map<String, Object> d = objectMapper.readValue(
                        step5.data(), new TypeReference<>() {});
                Object copy = d.get("copy");
                if (copy instanceof String s) japaneseCopy = s;
            } catch (Exception e) {
                log.warn("Step 5 데이터 파싱 실패 hospitalId={}", hospitalId, e);
            }
        }

        PublicSiteResponse response = PublicSiteResponse.builder()
                .id(hospital.getId())
                .nameKr(hospital.getNameKr())
                .nameJa(hospital.getNameJa())
                .clinicType(hospital.getClinicType())
                .specialty(hospital.getSpecialty())
                .phone(hospital.getPhone())
                .address(hospital.getAddress())
                .hours(hospital.getHours())
                .lineId(hospital.getLineId())
                .instagramId(hospital.getInstagramId())
                .siteUrl(hospital.getSiteUrl())
                .specialties(specialties)
                .suggestedKeywordsJa(suggestedKeywordsJa)
                .japaneseCopy(japaneseCopy)
                .build();

        return ResponseEntity.ok(response);
    }
}
