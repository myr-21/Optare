package com.signalfeed.service;

import com.signalfeed.dto.AnalyticsDiversityDto;
import com.signalfeed.dto.AnalyticsOverviewDto;
import com.signalfeed.model.ContentItem;
import com.signalfeed.model.InteractionType;
import com.signalfeed.model.Source;
import com.signalfeed.model.UserInteraction;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import com.signalfeed.repository.UserInteractionRepository;
import com.signalfeed.repository.ContentItemRepository;
import lombok.RequiredArgsConstructor;

import java.sql.Date;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserInteractionRepository userInteractionRepository;
    private final ContentItemRepository contentItemRepository;

    private static final List<InteractionType> SAVED_TYPES = List.of(
            InteractionType.BOOKMARK,
            InteractionType.WATCH_LATER,
            InteractionType.READ_LATER,
            InteractionType.FAVORITE
    );

    public AnalyticsOverviewDto getOverview(UUID userId) {
        // Fetch all viewed content items to build distributions
        // Limit to last 500 viewed items for performance, or fetch all
        List<Source> viewedSources = userInteractionRepository.findLastViewedSourcesByUserId(userId, PageRequest.of(0, 500));
        List<String> viewedCategories = userInteractionRepository.findLastViewedCategoriesByUserId(userId, PageRequest.of(0, 500));

        Map<String, Long> sourceDistribution = viewedSources.stream()
                .collect(Collectors.groupingBy(Source::name, Collectors.counting()));

        Map<String, Long> categoryDistribution = viewedCategories.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(c -> c, Collectors.counting()));

        // Activity by day (last 14 days)
        List<Object[]> activityData = userInteractionRepository.findActivityByDayLast14Days(userId);
        List<AnalyticsOverviewDto.ActivityDayDto> activityByDay = new ArrayList<>();
        
        // Fill dates map to ensure we have the past 14 days represented
        Map<String, Long> dateCounts = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();
        for (int i = 13; i >= 0; i--) {
            dateCounts.put(today.minusDays(i).toString(), 0L);
        }

        for (Object[] row : activityData) {
            if (row[0] != null && row[1] != null) {
                String dateStr = row[0].toString();
                long count = ((Number) row[1]).longValue();
                dateCounts.put(dateStr, count);
            }
        }

        dateCounts.forEach((date, count) -> 
            activityByDay.add(new AnalyticsOverviewDto.ActivityDayDto(date, count))
        );

        long totalViewed = userInteractionRepository.countViewedByUserId(userId);
        long totalSaved = userInteractionRepository.countSavedByUserId(userId, SAVED_TYPES);

        List<String> topCategories = categoryDistribution.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .map(Map.Entry::getKey)
                .limit(3)
                .collect(Collectors.toList());

        // Fill mock keys if distributions are empty (to align with frontend expectations)
        if (sourceDistribution.isEmpty()) {
            sourceDistribution.put("YOUTUBE", 0L);
            sourceDistribution.put("REDDIT", 0L);
            sourceDistribution.put("ARTICLE", 0L);
        }
        if (categoryDistribution.isEmpty()) {
            categoryDistribution.put("AI", 0L);
            categoryDistribution.put("PROGRAMMING", 0L);
        }

        return AnalyticsOverviewDto.builder()
                .sourceDistribution(sourceDistribution)
                .categoryDistribution(categoryDistribution)
                .activityByDay(activityByDay)
                .totalViewed(totalViewed)
                .totalSaved(totalSaved)
                .topCategories(topCategories)
                .build();
    }

    public AnalyticsDiversityDto getDiversity(UUID userId) {
        // Take user's last 50 VIEW interactions
        List<Source> lastSources = userInteractionRepository.findLastViewedSourcesByUserId(userId, PageRequest.of(0, 50));
        List<String> lastCategories = userInteractionRepository.findLastViewedCategoriesByUserId(userId, PageRequest.of(0, 50));

        int totalViews = lastSources.size();

        Map<String, Long> sourceBreakdown = lastSources.stream()
                .collect(Collectors.groupingBy(Source::name, Collectors.counting()));

        Map<String, Long> categoryBreakdown = lastCategories.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(c -> c, Collectors.counting()));

        String dominantCategory = "N/A";
        int dominantCategoryPercent = 0;

        if (totalViews > 0 && !categoryBreakdown.isEmpty()) {
            Map.Entry<String, Long> maxCategory = categoryBreakdown.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .orElseThrow();
            dominantCategory = maxCategory.getKey();
            dominantCategoryPercent = (int) Math.round((maxCategory.getValue() * 100.0) / totalViews);
        }

        String echoChamberRisk = "LOW";
        if (dominantCategoryPercent >= 70) {
            echoChamberRisk = "HIGH";
        } else if (dominantCategoryPercent >= 50) {
            echoChamberRisk = "MEDIUM";
        }

        long distinctSources = lastSources.stream().distinct().count();
        long distinctCategories = lastCategories.stream().filter(Objects::nonNull).distinct().count();

        // Formula: (distinctSources / 5) * 50 + (distinctCategories / 5) * 50
        double sourceFactor = (Math.min(distinctSources, 5.0) / 5.0) * 50.0;
        double categoryFactor = (Math.min(distinctCategories, 5.0) / 5.0) * 50.0;
        int diversityScore = (int) Math.round(sourceFactor + categoryFactor);
        diversityScore = Math.clamp(diversityScore, 0, 100);

        // Compute nudge message
        String nudgeMessage = "Your feed is well balanced! Keep exploring different topics.";
        if ("HIGH".equals(echoChamberRisk) || "MEDIUM".equals(echoChamberRisk)) {
            // Find a category user has NOT viewed much
            List<String> allCategories = List.of("AI", "PROGRAMMING", "CYBERSECURITY", "FINANCE", "STARTUPS", "SCIENCE", "PRODUCTIVITY", "DEVOPS", "OPEN_SOURCE");
            String alternativeCategory = "CYBERSECURITY";
            for (String cat : allCategories) {
                if (!cat.equalsIgnoreCase(dominantCategory) && !categoryBreakdown.containsKey(cat)) {
                    alternativeCategory = cat;
                    break;
                }
            }
            // Capitalize format
            String readableAlternative = alternativeCategory.charAt(0) + alternativeCategory.substring(1).toLowerCase();
            String readableDominant = dominantCategory.charAt(0) + dominantCategory.substring(1).toLowerCase();
            nudgeMessage = String.format("You've read mostly %s content lately. Explore %s?", readableDominant, readableAlternative);
        }

        return AnalyticsDiversityDto.builder()
                .diversityScore(diversityScore)
                .echoChamberRisk(echoChamberRisk)
                .sourceBreakdown(sourceBreakdown)
                .categoryBreakdown(categoryBreakdown)
                .dominantCategory(dominantCategory)
                .dominantCategoryPercent(dominantCategoryPercent)
                .nudgeMessage(nudgeMessage)
                .build();
    }
}
