package io.mediflow.core.platformbo.cs.dto;

import io.mediflow.core.platformbo.cs.entity.CsTicket;

import java.time.format.DateTimeFormatter;

public record CsTicketDto(
        Long id,
        String hospitalName,
        String type,
        String title,
        String status,
        String priority,
        String createdAt
) {
    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public static CsTicketDto from(CsTicket ticket) {
        return new CsTicketDto(
                ticket.getId(),
                ticket.getHospitalName(),
                ticket.getType(),
                ticket.getTitle(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getCreatedAt() != null ? ticket.getCreatedAt().format(FORMATTER) : null
        );
    }
}
