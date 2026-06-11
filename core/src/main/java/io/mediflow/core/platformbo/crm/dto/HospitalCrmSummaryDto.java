package io.mediflow.core.platformbo.crm.dto;

public record HospitalCrmSummaryDto(
        Long hospitalId,
        String hospitalName,
        int newCount,
        int pendingCount,
        int repliedCount
) {}
