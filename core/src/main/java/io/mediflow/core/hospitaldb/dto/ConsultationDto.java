package io.mediflow.core.hospitaldb.dto;

import java.time.LocalDateTime;

public record ConsultationDto(
        Long          id,
        Long          patientId,
        String        patientNameJa,
        String        channel,
        String        treatment,
        String        message,
        String        status,
        String        assignedTo,
        LocalDateTime createdAt,
        LocalDateTime repliedAt
) {}
