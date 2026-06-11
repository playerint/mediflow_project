package io.mediflow.core.hospitalbo.marketing.dto;

import java.util.List;

/**
 * GET /api/v1/hospital/marketing/stats 응답 DTO.
 * 채널별 유입 통계 + 월별 트렌드.
 */
public record MarketingStatsResponse(
        int totalLeads,
        List<ChannelStat> channels,
        List<MonthlyTrend> monthlyTrend
) {

    public record ChannelStat(
            String name,
            int leads,
            double rate
    ) {}

    public record MonthlyTrend(
            String month,
            int leads
    ) {}
}
