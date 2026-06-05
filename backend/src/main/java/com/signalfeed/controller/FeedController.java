package com.signalfeed.controller;

import com.signalfeed.config.UserPrincipal;
import com.signalfeed.dto.ContentItemDto;
import com.signalfeed.model.ContentItem;
import com.signalfeed.model.Source;
import com.signalfeed.recommendation.RecommendationService;
import com.signalfeed.repository.ContentItemRepository;
import com.signalfeed.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class FeedController {

    private final RecommendationService recommendationService;
    private final InteractionService interactionService;
    private final ContentItemRepository contentItemRepository;

    @GetMapping
    public ResponseEntity<Page<ContentItemDto>> getFeed(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String source
    ) {
        if (principal == null) {
            // Unauthenticated Guest Feed - fallback mode using real content items
            List<ContentItem> items;
            if (category != null && !category.trim().isEmpty() && source != null && !source.trim().isEmpty()) {
                try {
                    Source src = Source.valueOf(source.toUpperCase());
                    items = contentItemRepository.findAll().stream()
                            .filter(c -> c.getCategory() != null && c.getCategory().equalsIgnoreCase(category))
                            .filter(c -> c.getSource() == src)
                            .toList();
                } catch (IllegalArgumentException e) {
                    items = Collections.emptyList();
                }
            } else if (category != null && !category.trim().isEmpty()) {
                items = contentItemRepository.findAll().stream()
                        .filter(c -> c.getCategory() != null && c.getCategory().equalsIgnoreCase(category))
                        .toList();
            } else if (source != null && !source.trim().isEmpty()) {
                try {
                    Source src = Source.valueOf(source.toUpperCase());
                    items = contentItemRepository.findAll().stream()
                            .filter(c -> c.getSource() == src)
                            .toList();
                } catch (IllegalArgumentException e) {
                    items = Collections.emptyList();
                }
            } else {
                items = contentItemRepository.findAll();
            }

            List<ContentItemDto> dtos = new ArrayList<>();
            for (ContentItem item : items) {
                List<String> reasons = new ArrayList<>();
                if (item.getEngagementScore() != null && item.getEngagementScore() > 70) {
                    reasons.add("Trending this week");
                }
                reasons.add("Popular on " + item.getSource().name());

                dtos.add(ContentItemDto.builder()
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
                        .score(item.getEngagementScore() != null ? item.getEngagementScore().doubleValue() : 0.0)
                        .reasons(reasons)
                        .build());
            }

            // Sort by score (engagement score) DESC, then publishedDate DESC
            dtos.sort((a, b) -> {
                int scoreCompare = Double.compare(b.getScore(), a.getScore());
                if (scoreCompare != 0) {
                    return scoreCompare;
                }
                if (b.getPublishedDate() != null && a.getPublishedDate() != null) {
                    return b.getPublishedDate().compareTo(a.getPublishedDate());
                }
                return 0;
            });

            Pageable pageable = PageRequest.of(page, size);
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), dtos.size());
            
            List<ContentItemDto> pageList = Collections.emptyList();
            if (start < dtos.size()) {
                pageList = dtos.subList(start, end);
            }

            return ResponseEntity.ok(new PageImpl<>(pageList, pageable, dtos.size()));
        }

        UUID userId = principal.getId();
        Pageable pageable = PageRequest.of(page, size);
        Page<ContentItemDto> feed = recommendationService.getPersonalizedFeed(userId, category, source, pageable);

        return ResponseEntity.ok(feed);
    }
}
