package io.mediflow.core.hospitalbo.settings.dto;

import java.util.List;

/**
 * GET /api/v1/hospital/settings  응답 DTO.
 * PUT /api/v1/hospital/settings  요청·응답 DTO (동일 구조).
 *
 * 병원 운영 설정값을 담는다.
 * 추후 플랫폼 DB의 hospital_settings 테이블과 연결 예정.
 */
public record HospitalSettingsDto(
        String businessHours,
        String lunchBreak,
        List<String> closedDays,
        String notificationEmail,
        boolean autoReplyEnabled
) {}
