package io.mediflow.core.platformbo.user.dto;

public record UpdateProfileRequest(
        String displayName,
        String phone,
        String company
) {}
