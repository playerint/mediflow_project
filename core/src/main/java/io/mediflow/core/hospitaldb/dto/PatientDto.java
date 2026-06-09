package io.mediflow.core.hospitaldb.dto;

import java.time.LocalDateTime;

public record PatientDto(
        Long          id,
        String        nameJa,
        String        nameKo,
        String        email,
        String        phone,
        Integer       age,
        String        gender,
        String        country,
        String        preferredTreatment,
        String        status,
        LocalDateTime createdAt
) {}
