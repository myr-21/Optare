package com.signalfeed.service;

import com.signalfeed.dto.ContentItemDto;
import com.signalfeed.dto.TopicClusterDto;
import com.signalfeed.model.ContentItem;
import com.signalfeed.model.ContentType;
import com.signalfeed.repository.ContentItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicClusterService {

    private final ContentItemRepository contentItemRepository;

    public List<TopicClusterDto> getTopicClusters(Pageable pageable) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        
        // 1. Get top categories and tags in last 7 days
        List<String> topCategories = contentItemRepository.findTopCategoriesSince(sevenDaysAgo, PageRequest.of(0, 10));
        List<String> topTags = contentItemRepository.findTopTagsSince(sevenDaysAgo, PageRequest.of(0, 10));

        // 2. Combine and deduplicate
        LinkedHashSet<String> combinedTopics = new LinkedHashSet<>();
        
        // Alternate categories and tags to balance
        int maxLen = Math.max(topCategories.size(), topTags.size());
        for (int i = 0; i < maxLen; i++) {
            if (i < topCategories.size()) {
                combinedTopics.add(topCategories.get(i));
            }
            if (i < topTags.size()) {
                combinedTopics.add(topTags.get(i));
            }
        }

        // Limit to 10 topics
        List<String> top10Topics = combinedTopics.stream()
                .filter(Objects::nonNull)
                .filter(t -> !t.trim().isEmpty())
                .limit(10)
                .toList();

        List<TopicClusterDto> clusters = new ArrayList<>();

        for (String topic : top10Topics) {
            // Find items for this topic
            List<ContentItem> items = contentItemRepository.findByTopic(topic);

            // Group by Content Type and limit to 3 per type
            Map<String, List<ContentItemDto>> groupedItems = new HashMap<>();
            
            // Initialize empty groups to match frontend expectations
            groupedItems.put("VIDEO", new ArrayList<>());
            groupedItems.put("DISCUSSION", new ArrayList<>());
            groupedItems.put("ARTICLE", new ArrayList<>());

            Map<ContentType, List<ContentItem>> mappedGroups = items.stream()
                    .collect(Collectors.groupingBy(ContentItem::getContentType));

            for (Map.Entry<ContentType, List<ContentItem>> entry : mappedGroups.entrySet()) {
                List<ContentItemDto> dtos = entry.getValue().stream()
                        .limit(3)
                        .map(this::mapToDto)
                        .collect(Collectors.toList());
                groupedItems.put(entry.getKey().name(), dtos);
            }

            clusters.add(TopicClusterDto.builder()
                    .topic(topic)
                    .items(groupedItems)
                    .build());
        }

        // Apply in-memory paging
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), clusters.size());

        if (start >= clusters.size()) {
            return Collections.emptyList();
        }
        return clusters.subList(start, end);
    }

    public TopicClusterDto getTopicDetails(String topicName, Pageable pageable) {
        Page<ContentItem> itemsPage = contentItemRepository.findByTopic(topicName, pageable);

        Map<String, List<ContentItemDto>> groupedItems = new HashMap<>();
        groupedItems.put("VIDEO", new ArrayList<>());
        groupedItems.put("DISCUSSION", new ArrayList<>());
        groupedItems.put("ARTICLE", new ArrayList<>());

        Map<ContentType, List<ContentItem>> mappedGroups = itemsPage.getContent().stream()
                .collect(Collectors.groupingBy(ContentItem::getContentType));

        for (Map.Entry<ContentType, List<ContentItem>> entry : mappedGroups.entrySet()) {
            List<ContentItemDto> dtos = entry.getValue().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
            groupedItems.put(entry.getKey().name(), dtos);
        }

        return TopicClusterDto.builder()
                .topic(topicName)
                .items(groupedItems)
                .build();
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
                .reasons(List.of("Matches topic " + item.getCategory()))
                .build();
    }
}
