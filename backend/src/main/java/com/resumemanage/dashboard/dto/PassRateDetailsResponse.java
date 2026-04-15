package com.resumemanage.dashboard.dto;

import java.util.List;

public record PassRateDetailsResponse(
        String stage,
        List<PassRateItemDto> passed,
        List<PassRateItemDto> failed
) {
    public record PassRateItemDto(
            Long id,
            String company,
            String position,
            String eventAt
    ) {
    }
}
