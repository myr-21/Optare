package com.signalfeed.ingestion;

import com.signalfeed.model.ContentItem;
import com.signalfeed.model.ContentType;
import com.signalfeed.model.Source;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class YoutubeFetcher implements ContentFetcher {

    private static final Logger log = LoggerFactory.getLogger(YoutubeFetcher.class);

    private final RestTemplate restTemplate;
    
    @Value("${youtube.api.key:}")
    private String apiKey;

    private final String[] topics = {
        "AI", "machine learning", "programming", "cybersecurity",
        "finance", "startups", "science", "productivity", "gaming", "Java"
    };

    private final AtomicInteger topicIndex = new AtomicInteger(0);

    public YoutubeFetcher(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String getSource() {
        return "YOUTUBE";
    }

    @Override
    public List<ContentItem> fetch() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("YouTube API key is missing. Skipping YouTube ingestion.");
            return Collections.emptyList();
        }

        String topic = topics[topicIndex.getAndIncrement() % topics.length];
        String category = mapTopicToCategory(topic);

        log.info("Fetching YouTube content for topic: {} (Category: {})", topic, category);

        try {
            // Step 1: Search for videos
            String searchUrl = "https://www.googleapis.com/youtube/v3/search" +
                    "?part=snippet&type=video&maxResults=50&order=viewCount" +
                    "&q=" + topic + "&key=" + apiKey;

            Map<String, Object> searchResponse = restTemplate.getForObject(searchUrl, Map.class);
            if (searchResponse == null || !searchResponse.containsKey("items")) {
                log.warn("Empty response from YouTube search API.");
                return Collections.emptyList();
            }

            List<Map<String, Object>> searchItems = (List<Map<String, Object>>) searchResponse.get("items");
            if (searchItems.isEmpty()) {
                return Collections.emptyList();
            }

            // Extract video IDs
            List<String> videoIds = new ArrayList<>();
            for (Map<String, Object> item : searchItems) {
                Map<String, Object> idMap = (Map<String, Object>) item.get("id");
                if (idMap != null && "youtube#video".equals(idMap.get("kind"))) {
                    String videoId = (String) idMap.get("videoId");
                    if (videoId != null) {
                        videoIds.add(videoId);
                    }
                }
            }

            if (videoIds.isEmpty()) {
                return Collections.emptyList();
            }

            // Step 2: Fetch detailed statistics & tags in batch
            String idsParam = String.join(",", videoIds);
            String videosUrl = "https://www.googleapis.com/youtube/v3/videos" +
                    "?part=snippet,statistics&id=" + idsParam + "&key=" + apiKey;

            Map<String, Object> videosResponse = restTemplate.getForObject(videosUrl, Map.class);
            if (videosResponse == null || !videosResponse.containsKey("items")) {
                log.warn("Empty response from YouTube videos statistics API.");
                return Collections.emptyList();
            }

            List<Map<String, Object>> videoItems = (List<Map<String, Object>>) videosResponse.get("items");
            List<ContentItem> items = new ArrayList<>();

            for (Map<String, Object> video : videoItems) {
                try {
                    String id = (String) video.get("id");
                    Map<String, Object> snippet = (Map<String, Object>) video.get("snippet");
                    Map<String, Object> statistics = (Map<String, Object>) video.get("statistics");

                    if (snippet == null) continue;

                    String title = (String) snippet.get("title");
                    String description = (String) snippet.get("description");
                    if (description != null && description.length() > 500) {
                        description = description.substring(0, 497) + "...";
                    }

                    String channelTitle = (String) snippet.get("channelTitle");
                    String publishedAtStr = (String) snippet.get("publishedAt");
                    LocalDateTime publishedDate = null;
                    if (publishedAtStr != null) {
                        publishedDate = LocalDateTime.ofInstant(Instant.parse(publishedAtStr), ZoneId.of("UTC"));
                    }

                    String thumbnail = null;
                    Map<String, Object> thumbnails = (Map<String, Object>) snippet.get("thumbnails");
                    if (thumbnails != null) {
                        Map<String, Object> medium = (Map<String, Object>) thumbnails.get("medium");
                        if (medium != null) {
                            thumbnail = (String) medium.get("url");
                        }
                    }

                    List<String> tags = new ArrayList<>();
                    if (snippet.containsKey("tags")) {
                        tags = (List<String>) snippet.get("tags");
                    }

                    // Compute engagement score: (viewCount * 1 + likeCount * 5 + commentCount * 3) / 1000
                    double viewCount = parseDouble(statistics, "viewCount");
                    double likeCount = parseDouble(statistics, "likeCount");
                    double commentCount = parseDouble(statistics, "commentCount");
                    double score = (viewCount * 1.0 + likeCount * 5.0 + commentCount * 3.0) / 1000.0;
                    double normalizedScore = Math.clamp(score, 0.0, 100.0); // Clamps to 0-100 range

                    ContentItem item = ContentItem.builder()
                            .externalId(id)
                            .source(Source.YOUTUBE)
                            .contentType(ContentType.VIDEO)
                            .title(title)
                            .description(description)
                            .url("https://youtube.com/watch?v=" + id)
                            .thumbnail(thumbnail)
                            .author(channelTitle)
                            .category(category)
                            .tags(tags)
                            .publishedDate(publishedDate)
                            .engagementScore(normalizedScore)
                            .build();

                    items.add(item);
                } catch (Exception e) {
                    log.warn("Failed to parse YouTube video element: {}", e.getMessage());
                }
            }

            return items;
        } catch (Exception e) {
            log.warn("YouTube Fetcher failed during execution: {}", e.getMessage());
            return Collections.emptyList();
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

    private String mapTopicToCategory(String topic) {
        return switch (topic) {
            case "AI", "machine learning" -> "AI";
            case "programming", "Java" -> "PROGRAMMING";
            case "cybersecurity" -> "CYBERSECURITY";
            case "finance" -> "FINANCE";
            case "startups" -> "STARTUPS";
            case "science" -> "SCIENCE";
            case "productivity" -> "PRODUCTIVITY";
            case "gaming" -> "GAMING";
            default -> "AI";
        };
    }
}
