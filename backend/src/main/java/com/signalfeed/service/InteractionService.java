package com.signalfeed.service;

import com.signalfeed.dto.ContentItemDto;
import com.signalfeed.dto.InteractionRequest;
import com.signalfeed.model.*;
import com.signalfeed.repository.ContentItemRepository;
import com.signalfeed.repository.UserInteractionRepository;
import com.signalfeed.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final UserInteractionRepository userInteractionRepository;
    private final UserRepository userRepository;
    private final ContentItemRepository contentItemRepository;

    @Transactional
    public void recordInteraction(UUID userId, InteractionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        ContentItem contentItem = contentItemRepository.findById(request.getContentId())
                .orElseThrow(() -> new EntityNotFoundException("Content item not found"));

        InteractionType type = InteractionType.valueOf(request.getInteraction().toUpperCase());

        Optional<UserInteraction> existingOpt = userInteractionRepository
                .findByUserIdAndContentItemIdAndInteraction(userId, request.getContentId(), type);

        if (existingOpt.isPresent()) {
            UserInteraction existing = existingOpt.get();
            existing.setCreatedAt(LocalDateTime.now());
            existing.setCollectionName(request.getCollectionName());
            userInteractionRepository.save(existing);
        } else {
            UserInteraction interaction = UserInteraction.builder()
                    .user(user)
                    .contentItem(contentItem)
                    .interaction(type)
                    .collectionName(request.getCollectionName())
                    .build();
            userInteractionRepository.save(interaction);
        }
    }

    @Transactional
    public void recordViewInteraction(UUID userId, UUID contentId) {
        try {
            InteractionRequest request = new InteractionRequest();
            request.setContentId(contentId);
            request.setInteraction("VIEW");
            recordInteraction(userId, request);
        } catch (Exception e) {
            // Log and degrade gracefully so feed fetch doesn't crash if view fails
        }
    }

    @Transactional
    public void deleteInteraction(UUID userId, UUID contentId, String interactionType) {
        InteractionType type = InteractionType.valueOf(interactionType.toUpperCase());
        userInteractionRepository.deleteByUserIdAndContentItemIdAndInteraction(userId, contentId, type);
    }

    public Page<ContentItemDto> getBookmarks(UUID userId, String typeStr, String collection, Pageable pageable) {
        InteractionType type = InteractionType.BOOKMARK;
        if (typeStr != null && !typeStr.trim().isEmpty()) {
            try {
                type = InteractionType.valueOf(typeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // fallback
            }
        }

        Page<ContentItem> items;
        if (collection != null && !collection.trim().isEmpty()) {
            items = userInteractionRepository.findSavedContentByInteractionTypeAndCollection(userId, type, collection, pageable);
        } else {
            items = userInteractionRepository.findSavedContentByInteractionType(userId, type, pageable);
        }

        return items.map(this::mapToDto);
    }

    public List<String> getCollections(UUID userId) {
        return userInteractionRepository.findDistinctCollectionNamesByUserId(userId);
    }

    private ContentItemDto mapToDto(ContentItem item) {
        return ContentItemDto.builder()
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
                .score(0.0)
                .reasons(List.of("Saved by you"))
                .build();
    }
}
