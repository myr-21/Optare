package com.signalfeed.controller;

import com.signalfeed.config.UserPrincipal;
import com.signalfeed.dto.UserInterestDto;
import com.signalfeed.service.UserInterestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interests")
@RequiredArgsConstructor
public class UserInterestController {

    private final UserInterestService userInterestService;

    @GetMapping
    public ResponseEntity<List<UserInterestDto>> getInterests(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userInterestService.getUserInterests(principal.getId()));
    }

    @PutMapping
    public ResponseEntity<List<UserInterestDto>> updateInterests(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody List<UserInterestDto> interests
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userInterestService.updateUserInterests(principal.getId(), interests));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(userInterestService.getAvailableCategories());
    }
}
