package com.signalfeed.ingestion;

import com.signalfeed.model.ContentItem;
import com.signalfeed.model.ContentType;
import com.signalfeed.model.Source;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class HackerNewsFetcher implements ContentFetcher {

    private static final Logger log = LoggerFactory.getLogger(HackerNewsFetcher.class);

    private final RestTemplate restTemplate;
    private final ExecutorService executorService;

    public HackerNewsFetcher(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        // Concurrent fetching with max 10 parallel requests
        this.executorService = Executors.newFixedThreadPool(10);
    }

    @Override
    public String getSource() {
        return "HACKERNEWS";
    }

    @Override
    public List<ContentItem> fetch() {
        log.info("Fetching Hacker News top stories...");
        try {
            String topStoriesUrl = "https://hacker-news.firebaseio.com/v0/topstories.json";
            List<Integer> topIds = restTemplate.getForObject(topStoriesUrl, List.class);

            if (topIds == null || topIds.isEmpty()) {
                log.warn("Empty response from Hacker News top stories API.");
                return Collections.emptyList();
            }

            // Take first 50 IDs
            List<Integer> targetIds = topIds.subList(0, Math.min(topIds.size(), 50));

            List<CompletableFuture<ContentItem>> futures = targetIds.stream()
                    .map(id -> CompletableFuture.supplyAsync(() -> fetchItem(id), executorService))
                    .toList();

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            List<ContentItem> items = new ArrayList<>();
            for (CompletableFuture<ContentItem> future : futures) {
                try {
                    ContentItem item = future.get();
                    if (item != null) {
                        items.add(item);
                    }
                } catch (Exception e) {
                    // skip failed item
                }
            }

            log.info("Successfully fetched {} Hacker News stories.", items.size());
            return items;
        } catch (Exception e) {
            log.warn("Hacker News Fetcher failed: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private ContentItem fetchItem(Integer id) {
        try {
            String itemUrl = "https://hacker-news.firebaseio.com/v0/item/" + id + ".json";
            Map<String, Object> itemMap = restTemplate.getForObject(itemUrl, Map.class);

            if (itemMap == null) return null;

            String type = (String) itemMap.get("type");
            String url = (String) itemMap.get("url");

            // Only include items where type = "story" and url is not null
            if (!"story".equals(type) || url == null || url.trim().isEmpty()) {
                return null;
            }

            String title = (String) itemMap.get("title");
            String text = (String) itemMap.get("text");
            if (text != null && text.length() > 500) {
                text = text.substring(0, 497) + "...";
            }

            String author = (String) itemMap.get("by");
            double time = parseDouble(itemMap, "time");
            LocalDateTime publishedDate = LocalDateTime.ofInstant(
                    Instant.ofEpochSecond((long) time), ZoneId.of("UTC"));

            double score = parseDouble(itemMap, "score");
            double engagementScore = Math.min((score / 50.0) * 10.0, 100.0);

            String category = inferCategoryFromTitle(title);

            return ContentItem.builder()
                    .externalId(String.valueOf(id))
                    .source(Source.HACKERNEWS)
                    .contentType(ContentType.DISCUSSION)
                    .title(title)
                    .description(text)
                    .url(url)
                    .author(author)
                    .category(category)
                    .tags(Collections.emptyList())
                    .publishedDate(publishedDate)
                    .engagementScore(engagementScore)
                    .build();

        } catch (Exception e) {
            log.warn("Failed to fetch Hacker News item details for ID {}: {}", id, e.getMessage());
            return null;
        }
    }

    private double parseDouble(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key)) return 0.0;
        try {
            return Double.parseDouble(map.get(key).toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private String inferCategoryFromTitle(String title) {
        if (title == null) return "SCIENCE";
        String lowerTitle = title.toLowerCase();

        if (lowerTitle.contains("ai") || lowerTitle.contains("llm") || lowerTitle.contains("gpt") ||
            lowerTitle.contains("deepmind") || lowerTitle.contains("neural") || lowerTitle.contains("claude") ||
            lowerTitle.contains("openai") || lowerTitle.contains("machine learning")) {
            return "AI";
        }
        if (lowerTitle.contains("java") || lowerTitle.contains("python") || lowerTitle.contains("rust") ||
            lowerTitle.contains("c++") || lowerTitle.contains("javascript") || lowerTitle.contains("golang") ||
            lowerTitle.contains("programming") || lowerTitle.contains("compiler") || lowerTitle.contains("coding") ||
            lowerTitle.contains("git") || lowerTitle.contains("webdev")) {
            return "PROGRAMMING";
        }
        if (lowerTitle.contains("sec") || lowerTitle.contains("hack") || lowerTitle.contains("exploit") ||
            lowerTitle.contains("cve") || lowerTitle.contains("security") || lowerTitle.contains("vulnerability") ||
            lowerTitle.contains("encryption")) {
            return "CYBERSECURITY";
        }
        if (lowerTitle.contains("startup") || lowerTitle.contains("founder") || lowerTitle.contains("y-combinator") ||
            lowerTitle.contains("saas") || lowerTitle.contains("funding") || lowerTitle.contains("investor") ||
            lowerTitle.contains("venture")) {
            return "STARTUPS";
        }
        if (lowerTitle.contains("crypto") || lowerTitle.contains("blockchain") || lowerTitle.contains("bitcoin") ||
            lowerTitle.contains("ethereum") || lowerTitle.contains("solana")) {
            return "CRYPTO";
        }
        if (lowerTitle.contains("linux") || lowerTitle.contains("docker") || lowerTitle.contains("kubernetes") ||
            lowerTitle.contains("aws") || lowerTitle.contains("devops") || lowerTitle.contains("ci/cd")) {
            return "DEVOPS";
        }
        if (lowerTitle.contains("productivity") || lowerTitle.contains("workflow") || lowerTitle.contains("optimize") ||
            lowerTitle.contains("focus")) {
            return "PRODUCTIVITY";
        }
        return "SCIENCE"; // Default
    }

    @PreDestroy
    public void shutdown() {
        executorService.shutdown();
    }
}
