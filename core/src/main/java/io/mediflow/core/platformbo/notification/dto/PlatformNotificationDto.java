package io.mediflow.core.platformbo.notification.dto;

import io.mediflow.core.platformbo.notification.entity.PlatformNotification;

import java.time.format.DateTimeFormatter;

/**
 * 본사 알림 응답 DTO.
 * createdAt은 ISO-8601 문자열(yyyy-MM-dd'T'HH:mm:ss)로 직렬화한다.
 */
public record PlatformNotificationDto(
        Long id,
        String type,
        String title,
        String body,
        boolean read,
        String createdAt
) {
    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public static PlatformNotificationDto from(PlatformNotification entity) {
        return new PlatformNotificationDto(
                entity.getId(),
                entity.getType(),
                entity.getTitle(),
                entity.getBody(),
                entity.isRead(),
                entity.getCreatedAt() != null
                        ? entity.getCreatedAt().format(FORMATTER)
                        : null
        );
    }
}
