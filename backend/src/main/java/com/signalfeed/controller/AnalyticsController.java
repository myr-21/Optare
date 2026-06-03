package com.signalfeed.controller;

import com.signalfeed.config.UserPrincipal;
import com.signalfeed.dto.AnalyticsDiversityDto;
import com.signalfeed.dto.AnalyticsOverviewDto;
import com.signalfeed.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewDto> getOverview(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(analyticsService.getOverview(principal.getId()));
    }

    @GetMapping("/diversity")
    public ResponseEntity<AnalyticsDiversityDto> getDiversity(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(analyticsService.getDiversity(principal.getId()));
    }
}
