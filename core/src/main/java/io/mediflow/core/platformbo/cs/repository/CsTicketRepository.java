package io.mediflow.core.platformbo.cs.repository;

import io.mediflow.core.platformbo.cs.entity.CsTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CsTicketRepository extends JpaRepository<CsTicket, Long> {
    List<CsTicket> findAllByOrderByCreatedAtDesc();
    List<CsTicket> findByStatusOrderByCreatedAtDesc(String status);
}
