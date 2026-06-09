package io.mediflow.core.onboarding.dto;

import io.mediflow.core.onboarding.entity.Onboarding;
import io.mediflow.core.onboarding.entity.OnboardingStep;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class OnboardingResponse {

    private Long   id;
    private Long   hospitalId;
    private int    currentStep;
    private String currentStepName;
    private String status;
    private int    progressPct;         // 완료율 (0~100)
    private String publishedSiteUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OnboardingResponse from(Onboarding o) {
        int pct = (int) Math.round(((double)(o.getCurrentStep() - 1) / OnboardingStep.TOTAL_STEPS) * 100);
        String stepName = OnboardingStep.of(o.getCurrentStep()).getName();

        return OnboardingResponse.builder()
                .id(o.getId())
                .hospitalId(o.getHospitalId())
                .currentStep(o.getCurrentStep())
                .currentStepName(stepName)
                .status(o.getStatus())
                .progressPct(pct)
                .publishedSiteUrl(o.getPublishedSiteUrl())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
