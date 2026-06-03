package com.signalfeed.controller;

import com.signalfeed.config.UserPrincipal;
import com.signalfeed.dto.ContentItemDto;
import com.signalfeed.dto.InteractionRequest;
import com.signalfeed.service.InteractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @PostMapping("/interactions")
    public ResponseEntity<Void> recordInteraction(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InteractionRequest request
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        interactionService.recordInteraction(principal.getId(), request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/interactions/{contentId}/{interaction}")
    public ResponseEntity<Void> deleteInteraction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID contentId,
            @PathVariable String interaction
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        interactionService.deleteInteraction(principal.getId(), contentId, interaction);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<Page<ContentItemDto>> getBookmarks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false, defaultValue = "") String type,
            @RequestParam(required = false, defaultValue = "") String collection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(interactionService.getBookmarks(principal.getId(), type, collection, pageable));
    }

    @GetMapping("/bookmarks/collections")
    public ResponseEntity<List<String>> getCollections(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(interactionService.getCollections(principal.getId()));
    }
}
