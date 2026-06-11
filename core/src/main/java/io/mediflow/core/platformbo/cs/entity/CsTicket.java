package io.mediflow.core.platformbo.cs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cs_tickets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CsTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 특정 병원과 무관한 티켓의 경우 null 허용 */
    @Column
    private String hospitalName;

    /** 불만 / 문의 / 오류 / 컴플라이언스 */
    @Column(nullable = false, length = 30)
    private String type;

    @Column(nullable = false)
    private String title;

    /** open / progress / closed */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "open";

    /** high / mid / low */
    @Column(nullable = false, length = 10)
    private String priority;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void changeStatus(String newStatus) {
        this.status = newStatus;
    }
}
