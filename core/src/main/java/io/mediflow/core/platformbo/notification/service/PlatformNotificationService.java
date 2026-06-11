package io.mediflow.core.platformbo.notification.service;

import io.mediflow.core.common.exception.ResourceNotFoundException;
import io.mediflow.core.platformbo.notification.dto.PlatformNotificationDto;
import io.mediflow.core.platformbo.notification.entity.PlatformNotification;
import io.mediflow.core.platformbo.notification.repository.PlatformNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 본사용 알림 서비스.
 * 플랫폼 레벨이므로 TenantContext 사용 금지.
 */
@Service
@RequiredArgsConstructor
public class PlatformNotificationService {

    private final PlatformNotificationRepository notificationRepository;

    /** 전체 알림 최신순 조회 */
    @Transactional(readOnly = true)
    public List<PlatformNotificationDto> getAll() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PlatformNotificationDto::from)
                .collect(Collectors.toList());
    }

    /** 단건 읽음 처리 */
    @Transactional
    public void markRead(Long id) {
        PlatformNotification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("알림을 찾을 수 없습니다. id=" + id));
        notification.markAsRead();
        notificationRepository.save(notification);
    }

    /** 전체 읽음 처리 */
    @Transactional
    public void markAllRead() {
        List<PlatformNotification> unread = notificationRepository.findAll()
                .stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());
        unread.forEach(PlatformNotification::markAsRead);
        notificationRepository.saveAll(unread);
    }
}
