package io.mediflow.core.platformbo.cs.service;

import io.mediflow.core.common.exception.ResourceNotFoundException;
import io.mediflow.core.platformbo.cs.dto.CreateCsTicketRequest;
import io.mediflow.core.platformbo.cs.dto.CsTicketDto;
import io.mediflow.core.platformbo.cs.entity.CsTicket;
import io.mediflow.core.platformbo.cs.repository.CsTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CsTicketService {

    private final CsTicketRepository csTicketRepository;

    /** 전체 또는 상태별 티켓 목록 조회 */
    @Transactional(readOnly = true)
    public List<CsTicketDto> getAll(String status) {
        List<CsTicket> tickets;
        if (status == null || status.isBlank()) {
            tickets = csTicketRepository.findAllByOrderByCreatedAtDesc();
        } else {
            tickets = csTicketRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        return tickets.stream().map(CsTicketDto::from).toList();
    }

    /** 티켓 상태 변경 */
    @Transactional
    public CsTicketDto updateStatus(Long id, String newStatus) {
        CsTicket ticket = csTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CsTicket not found: " + id));
        ticket.changeStatus(newStatus);
        csTicketRepository.save(ticket);
        return CsTicketDto.from(ticket);
    }

    /** 새 티켓 생성 */
    @Transactional
    public CsTicketDto create(CreateCsTicketRequest req) {
        CsTicket ticket = CsTicket.builder()
                .hospitalName(req.hospitalName())
                .type(req.type())
                .title(req.title())
                .priority(req.priority())
                .build();
        return CsTicketDto.from(csTicketRepository.save(ticket));
    }
}
