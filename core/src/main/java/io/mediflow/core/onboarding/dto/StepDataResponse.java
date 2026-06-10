package io.mediflow.core.onboarding.dto;

import io.mediflow.core.onboarding.entity.OnboardingStepData;
import java.time.LocalDateTime;

public record StepDataResponse(
        Long id,
        Long hospitalId,
        int stepNumber,
        String data,
        LocalDateTime completedAt,
        LocalDateTime updatedAt
) {
    public static StepDataResponse from(OnboardingStepData e) {
        return new StepDataResponse(
                e.getId(),
                e.getHospitalId(),
                e.getStepNumber(),
                e.getData(),
                e.getCompletedAt(),
                e.getUpdatedAt()
        );
    }
}
