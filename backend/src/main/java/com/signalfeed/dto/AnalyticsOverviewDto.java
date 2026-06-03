package com.signalfeed.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewDto {
    private Map<String, Long> sourceDistribution;
    private Map<String, Long> categoryDistribution;
    private List<ActivityDayDto> activityByDay;
    private long totalViewed;
    private long totalSaved;
    private List<String> topCategories;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ActivityDayDto {
        private String date;
        private long count;
    }
}
