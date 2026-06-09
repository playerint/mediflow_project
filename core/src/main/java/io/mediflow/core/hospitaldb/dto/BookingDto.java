package io.mediflow.core.hospitaldb.dto;

import java.time.LocalDateTime;

public record BookingDto(
        Long          id,
        Long          patientId,
        String        patientNameJa,
        String        treatment,
        String        doctor,
        LocalDateTime scheduledAt,
        String        status,
        String        notes,
        LocalDateTime createdAt
) {}
