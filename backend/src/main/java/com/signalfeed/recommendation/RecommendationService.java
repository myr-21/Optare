package com.signalfeed.recommendation;

import com.signalfeed.dto.ContentItemDto;
import com.signalfeed.model.*;
import com.signalfeed.repository.ContentItemRepository;
import com.signalfeed.repository.UserInterestRepository;
import com.signalfeed.repository.UserInteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final ContentItemRepository contentItemRepository;
    private final UserInterestRepository userInterestRepository;
    private final UserInteractionRepository userInteractionRepository;

    public Page<ContentItemDto> getPersonalizedFeed(
            UUID userId,
            String categoryFilter,
            String sourceFilter,
            Pageable pageable
    ) {
        // 1. Fetch user interests and build weight map
        List<UserInterest> interests = userInterestRepository.findByUserId(userId);
        Map<String, InterestWeight> interestWeights = interests.stream()
                .collect(Collectors.toMap(
                        ui -> ui.getCategory().toUpperCase(),
                        UserInterest::getWeight,
                        (existing, replacement) -> replacement
                ));

        // Fetch VIEW and DISMISS ids separately for logging/recovery
        List<UUID> viewedIds = userInteractionRepository.findContentIdsByUserIdAndInteractions(userId, List.of(InteractionType.VIEW));
        List<UUID> dismissedIds = userInteractionRepository.findContentIdsByUserIdAndInteractions(userId, List.of(InteractionType.DISMISS));
        
        Set<UUID> viewedSet = new HashSet<>(viewedIds);
        Set<UUID> dismissedSet = new HashSet<>(dismissedIds);

        // Recovery: temporarily ignore VIEW interactions in exclusions, keep DISMISS exclusion behavior.
        Set<UUID> excludedSet = new HashSet<>(dismissedIds);

        // 3. Fetch user's saved categories (BOOKMARK, FAVORITE, WATCH_LATER, READ_LATER)
        List<InteractionType> savedTypes = List.of(
                InteractionType.BOOKMARK,
                InteractionType.FAVORITE,
                InteractionType.WATCH_LATER,
                InteractionType.READ_LATER
        );
        List<String> savedCategories = userInteractionRepository.findDistinctSavedCategoriesByUserIdAndInteractions(userId, savedTypes);
        Set<String> savedCategoriesSet = savedCategories.stream()
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        // 4. Fetch user's last 20 viewed sources for diversity bonus
        List<Source> lastViewedSources = userInteractionRepository.findLastViewedSourcesByUserId(userId, PageRequest.of(0, 20));
        Map<Source, Long> sourceCounts = lastViewedSources.stream()
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()));
        int totalViewed = lastViewedSources.size();

        // 5. Fetch all content items from DB (we could optimize to fetch last 30 days of items)
        // Let's filter out database results if category/source filters are passed
        List<ContentItem> items;
        if (categoryFilter != null && !categoryFilter.trim().isEmpty() && sourceFilter != null && !sourceFilter.trim().isEmpty()) {
            try {
                Source src = Source.valueOf(sourceFilter.toUpperCase());
                items = contentItemRepository.findAll().stream()
                        .filter(c -> c.getCategory() != null && c.getCategory().equalsIgnoreCase(categoryFilter))
                        .filter(c -> c.getSource() == src)
                        .toList();
            } catch (IllegalArgumentException e) {
                items = Collections.emptyList();
            }
        } else if (categoryFilter != null && !categoryFilter.trim().isEmpty()) {
            items = contentItemRepository.findAll().stream()
                    .filter(c -> c.getCategory() != null && c.getCategory().equalsIgnoreCase(categoryFilter))
                    .toList();
        } else if (sourceFilter != null && !sourceFilter.trim().isEmpty()) {
            try {
                Source src = Source.valueOf(sourceFilter.toUpperCase());
                items = contentItemRepository.findAll().stream()
                        .filter(c -> c.getSource() == src)
                        .toList();
            } catch (IllegalArgumentException e) {
                items = Collections.emptyList();
            }
        } else {
            items = contentItemRepository.findAll();
        }

        long totalContentCount = items.size();
        long excludedViewCount = items.stream().filter(item -> viewedSet.contains(item.getId())).count();
        long excludedDismissCount = items.stream().filter(item -> dismissedSet.contains(item.getId())).count();

        List<ContentItemDto> scoredItems = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (ContentItem item : items) {
            // Exclude already seen/dismissed items
            if (excludedSet.contains(item.getId())) {
                continue;
            }

            String itemCategory = item.getCategory() != null ? item.getCategory().toUpperCase() : "";
            InterestWeight weight = interestWeights.get(itemCategory);

            // Exclude items in categories user set to IGNORE
            if (weight == InterestWeight.IGNORE) {
                continue;
            }

            // Calculate Interest Score
            double interestScore = 0;
            if (weight != null) {
                interestScore = switch (weight) {
                    case HIGH -> 100.0;
                    case MEDIUM -> 20.0;
                    case LOW -> 10.0;
                    default -> 0.0;
                };
            }

            // Calculate Freshness Score
            double freshnessScore = 0;
            if (item.getPublishedDate() != null) {
                long hoursOld = Duration.between(item.getPublishedDate(), now).toHours();
                if (hoursOld >= 0) {
                    if (hoursOld < 6) {
                        freshnessScore = 30.0;
                    } else if (hoursOld < 24) {
                        freshnessScore = 20.0;
                    } else if (hoursOld < 72) { // 3 days
                        freshnessScore = 10.0;
                    }
                }
            }

            // Calculate Engagement Score: scale down to max 20 points
            double engagementScore = 0;
            if (item.getEngagementScore() != null) {
                engagementScore = item.getEngagementScore() * 0.2;
            }

            // Calculate Saved Similarity Score
            double savedSimilarityScore = 0;
            if (!itemCategory.isEmpty() && savedCategoriesSet.contains(itemCategory)) {
                savedSimilarityScore = 15.0;
            }

            // Calculate Diversity Bonus
            double diversityBonus = 0;
            Source source = item.getSource();
            if (totalViewed == 0) {
                diversityBonus = 10.0; // Underrepresented since total is 0
            } else {
                long count = sourceCounts.getOrDefault(source, 0L);
                double proportion = (double) count / totalViewed;
                if (proportion < 0.20) {
                    diversityBonus = 10.0;
                }
            }

            // Compute final recommendation score
            double finalScore = interestScore + freshnessScore + engagementScore + savedSimilarityScore + diversityBonus;

            // Compile explanations (reasons)
            List<String> reasons = new ArrayList<>();
            if (interestScore > 0) {
                reasons.add("Matches your " + item.getCategory() + " interest");
            }
            if (freshnessScore >= 20) {
                reasons.add("Published recently");
            }
            if (savedSimilarityScore > 0) {
                reasons.add("Similar to saved content");
            }
            if (item.getEngagementScore() != null && item.getEngagementScore() > 70) {
                reasons.add("Trending this week");
            }
            if (diversityBonus > 0) {
                reasons.add("Broadens your feed");
            }
            if (item.getSource() == Source.REDDIT) {
                reasons.add("Popular on Reddit");
            }
            
            // Always include at least one reason
            if (reasons.isEmpty()) {
                reasons.add("Recommended for you");
            }

            scoredItems.add(ContentItemDto.builder()
                    .id(item.getId())
                    .title(item.getTitle())
                    .description(item.getDescription())
                    .url(item.getUrl())
                    .thumbnail(item.getThumbnail())
                    .source(item.getSource().name())
                    .contentType(item.getContentType().name())
                    .author(item.getAuthor())
                    .category(item.getCategory())
                    .tags(item.getTags() != null ? item.getTags() : Collections.emptyList())
                    .publishedDate(item.getPublishedDate())
                    .engagementScore(item.getEngagementScore())
                    .score(finalScore)
                    .reasons(reasons)
                    .build());
        }

        // Sort items by recommendation score DESC
        scoredItems.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        // Perform in-memory pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), scoredItems.size());
        
        List<ContentItemDto> pageList = Collections.emptyList();
        if (start < scoredItems.size()) {
            pageList = scoredItems.subList(start, end);
        }

        int candidateCount = scoredItems.size();
        log.info("Feed Recommendation Stats: totalContentCount={}, viewedCount={}, dismissedCount={}, candidateCount={}, finalRecommendationCount={}", 
                totalContentCount, excludedViewCount, excludedDismissCount, candidateCount, pageList.size());

        return new PageImpl<>(pageList, pageable, scoredItems.size());
    }
}
