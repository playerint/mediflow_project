package io.mediflow.core.platformbo.notification.controller;

import io.mediflow.core.platformbo.notification.dto.PlatformNotificationDto;
import io.mediflow.core.platformbo.notification.service.PlatformNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 본사용 BO — 알림 API.
 * 인증: SecurityConfig의 anyRequest().authenticated() 적용.
 */
@RestController
@RequestMapping("/api/v1/platform/notifications")
@RequiredArgsConstructor
public class PlatformNotificationController {

    private final PlatformNotificationService notificationService;

    /**
     * GET /api/v1/platform/notifications
     * 전체 알림 목록 최신순 반환.
     */
    @GetMapping
    public ResponseEntity<List<PlatformNotificationDto>> getAll() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    /**
     * PATCH /api/v1/platform/notifications/{id}/read
     * 특정 알림 읽음 처리.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/v1/platform/notifications/read-all
     * 전체 알림 읽음 처리.
     */
    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.noContent().build();
    }
}
