package io.mediflow.core.platformbo.user.dto;

import io.mediflow.core.user.entity.User;

import java.time.format.DateTimeFormatter;

public record PlatformUserDto(
        Long id,
        String username,
        String displayName,
        String phone,
        String company,
        String role,
        String createdAt
) {
    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public static PlatformUserDto from(User user) {
        return new PlatformUserDto(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getPhone(),
                user.getCompany(),
                user.getRole(),
                user.getCreatedAt() != null ? user.getCreatedAt().format(FORMATTER) : null
        );
    }
}
