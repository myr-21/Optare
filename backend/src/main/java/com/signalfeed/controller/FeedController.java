package com.signalfeed.controller;

import com.signalfeed.config.UserPrincipal;
import com.signalfeed.dto.ContentItemDto;
import com.signalfeed.recommendation.RecommendationService;
import com.signalfeed.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class FeedController {

    private final RecommendationService recommendationService;
    private final InteractionService interactionService;

    @GetMapping
    public ResponseEntity<Page<ContentItemDto>> getFeed(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String source
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        UUID userId = principal.getId();
        Pageable pageable = PageRequest.of(page, size);
        Page<ContentItemDto> feed = recommendationService.getPersonalizedFeed(userId, category, source, pageable);

        return ResponseEntity.ok(feed);
    }
}
