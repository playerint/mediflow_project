package io.mediflow.core.platformbo.cs.dto;

public record CreateCsTicketRequest(
        String hospitalName,
        String type,
        String title,
        String priority
) {}
