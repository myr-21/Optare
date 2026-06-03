package com.signalfeed.ingestion;

import com.signalfeed.model.ContentItem;
import com.signalfeed.model.ContentType;
import com.signalfeed.model.Source;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RedditFetcher implements ContentFetcher {

    private static final Logger log = LoggerFactory.getLogger(RedditFetcher.class);

    private final RestTemplate restTemplate;

    @Value("${reddit.user-agent:SignalFeed/1.0 (content aggregator)}")
    private String userAgent;

    private final String[] subreddits = {
        "artificial", "MachineLearning", "programming", "netsec",
        "investing", "startups", "science", "productivity", "gamedev", "java"
    };

    private final AtomicInteger subredditIndex = new AtomicInteger(0);

    public RedditFetcher(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String getSource() {
        return "REDDIT";
    }

    @Override
    public List<ContentItem> fetch() {
        String subreddit = subreddits[subredditIndex.getAndIncrement() % subreddits.length];
        String category = mapSubredditToCategory(subreddit);

        log.info("Fetching Reddit content for r/{} (Category: {})", subreddit, category);

        try {
            String url = "https://www.reddit.com/r/" + subreddit + "/hot.json?limit=25";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", userAgent);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            Map<String, Object> body = response.getBody();

            if (body == null || !body.containsKey("data")) {
                log.warn("Empty response from Reddit API for r/{}.", subreddit);
                return Collections.emptyList();
            }

            Map<String, Object> data = (Map<String, Object>) body.get("data");
            if (data == null || !data.containsKey("children")) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> children = (List<Map<String, Object>>) data.get("children");
            List<ContentItem> items = new ArrayList<>();

            for (Map<String, Object> child : children) {
                try {
                    Map<String, Object> postData = (Map<String, Object>) child.get("data");
                    if (postData == null) continue;

                    String id = (String) postData.get("id");
                    String title = (String) postData.get("title");
                    String selftext = (String) postData.get("selftext");
                    if (selftext != null && selftext.length() > 500) {
                        selftext = selftext.substring(0, 497) + "...";
                    }

                    String permalink = (String) postData.get("permalink");
                    String postUrl = "https://reddit.com" + permalink;

                    String thumbnail = (String) postData.get("thumbnail");
                    if (thumbnail == null || !thumbnail.startsWith("http")) {
                        thumbnail = null;
                    }

                    String author = (String) postData.get("author");
                    
                    List<String> tags = new ArrayList<>();
                    String flair = (String) postData.get("link_flair_text");
                    if (flair != null && !flair.trim().isEmpty()) {
                        tags.add(flair);
                    }

                    double createdUtc = parseDouble(postData, "created_utc");
                    LocalDateTime publishedDate = LocalDateTime.ofInstant(
                            Instant.ofEpochSecond((long) createdUtc), ZoneId.of("UTC"));

                    double score = parseDouble(postData, "score");
                    double engagementScore = Math.min((score / 100.0) * 10.0, 100.0);

                    ContentItem item = ContentItem.builder()
                            .externalId(id)
                            .source(Source.REDDIT)
                            .contentType(ContentType.DISCUSSION)
                            .title(title)
                            .description(selftext)
                            .url(postUrl)
                            .thumbnail(thumbnail)
                            .author(author)
                            .category(category)
                            .tags(tags)
                            .publishedDate(publishedDate)
                            .engagementScore(engagementScore)
                            .build();

                    items.add(item);
                } catch (Exception e) {
                    log.warn("Failed to parse Reddit post element: {}", e.getMessage());
                }
            }

            return items;
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("Reddit Fetcher HTTP error for r/{}: Status Code: {}, Response: {}", 
                      subreddit, e.getStatusCode(), e.getResponseBodyAsString());
            return Collections.emptyList();
        } catch (Exception e) {
            log.warn("Reddit Fetcher failed for r/{}: {}", subreddit, e.getMessage());
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

    private String mapSubredditToCategory(String subreddit) {
        return switch (subreddit.toLowerCase()) {
            case "artificial", "machinelearning" -> "AI";
            case "programming", "java" -> "PROGRAMMING";
            case "netsec" -> "CYBERSECURITY";
            case "investing" -> "FINANCE";
            case "startups" -> "STARTUPS";
            case "science" -> "SCIENCE";
            case "productivity" -> "PRODUCTIVITY";
            case "gamedev" -> "GAMING";
            default -> "AI";
        };
    }
}
