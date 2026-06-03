package com.signalfeed.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDiversityDto {
    private int diversityScore;
    private String echoChamberRisk; // LOW | MEDIUM | HIGH
    private Map<String, Long> sourceBreakdown;
    private Map<String, Long> categoryBreakdown;
    private String dominantCategory;
    private int dominantCategoryPercent;
    private String nudgeMessage;
}
