package com.signalfeed.ingestion;

import com.signalfeed.model.ContentItem;
import com.signalfeed.repository.ContentItemRepository;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@EnableScheduling
public class IngestionScheduler {

    private static final Logger log = LoggerFactory.getLogger(IngestionScheduler.class);

    private final List<ContentFetcher> fetchers;
    private final ContentItemRepository contentItemRepository;
    
    // Create a single-threaded executor per source (mapped by source name)
    private final Map<String, ExecutorService> sourceExecutors = new HashMap<>();

    public IngestionScheduler(List<ContentFetcher> fetchers, ContentItemRepository contentItemRepository) {
        this.fetchers = fetchers;
        this.contentItemRepository = contentItemRepository;
        
        // Initialize an executor per source
        for (ContentFetcher fetcher : fetchers) {
            sourceExecutors.computeIfAbsent(fetcher.getSource(), k -> Executors.newSingleThreadExecutor());
        }
    }

    // Run every 45 minutes (45 * 60 * 1000 = 2700000ms)
    @Scheduled(fixedDelay = 2700000, initialDelay = 10000)
    public void runIngestion() {
        log.info("Starting scheduled content ingestion...");
        for (ContentFetcher fetcher : fetchers) {
            ExecutorService executor = sourceExecutors.get(fetcher.getSource());
            if (executor != null) {
                executor.submit(() -> {
                    try {
                        List<ContentItem> items = fetcher.fetch();
                        if (items != null && !items.isEmpty()) {
                            log.info("Ingesting {} items from source {}", items.size(), fetcher.getSource());
                            saveOrUpdateItems(items);
                        }
                    } catch (Exception e) {
                        log.warn("Error running fetcher for source {}: {}", fetcher.getSource(), e.getMessage());
                    }
                });
            }
        }
    }

    private synchronized void saveOrUpdateItems(List<ContentItem> items) {
        for (ContentItem item : items) {
            try {
                Optional<ContentItem> existingOpt = contentItemRepository
                        .findBySourceAndExternalId(item.getSource(), item.getExternalId());

                if (existingOpt.isPresent()) {
                    ContentItem existing = existingOpt.get();
                    existing.setEngagementScore(item.getEngagementScore());
                    // Save updated engagement score
                    contentItemRepository.save(existing);
                } else {
                    // Insert new item
                    contentItemRepository.save(item);
                }
            } catch (Exception e) {
                log.warn("Failed to save/update item {}-{}: {}", item.getSource(), item.getExternalId(), e.getMessage());
            }
        }
    }

    @PreDestroy
    public void shutdown() {
        log.info("Shutting down ingestion executors...");
        sourceExecutors.values().forEach(ExecutorService::shutdown);
    }
}
