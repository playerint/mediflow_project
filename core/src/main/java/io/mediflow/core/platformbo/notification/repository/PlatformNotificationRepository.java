package io.mediflow.core.platformbo.notification.repository;

import io.mediflow.core.platformbo.notification.entity.PlatformNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 본사 알림 JPA 리포지토리.
 */
public interface PlatformNotificationRepository extends JpaRepository<PlatformNotification, Long> {

    /** 전체 알림을 최신순으로 조회 */
    List<PlatformNotification> findAllByOrderByCreatedAtDesc();
}
