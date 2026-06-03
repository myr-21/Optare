package com.signalfeed.ingestion;

import com.signalfeed.model.ContentItem;
import com.signalfeed.model.ContentType;
import com.signalfeed.model.Source;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class DevToFetcher implements ContentFetcher {

    private static final Logger log = LoggerFactory.getLogger(DevToFetcher.class);

    private final RestTemplate restTemplate;

    private final String[] tags = {
        "ai", "java", "webdev", "security", "productivity", "career", "opensource", "devops"
    };

    private final AtomicInteger tagIndex = new AtomicInteger(0);

    public DevToFetcher(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String getSource() {
        return "DEVTO";
    }

    @Override
    public List<ContentItem> fetch() {
        String tag = tags[tagIndex.getAndIncrement() % tags.length];
        String category = mapTagToCategory(tag);

        log.info("Fetching Dev.to articles for tag: {} (Category: {})", tag, category);

        try {
            String url = "https://dev.to/api/articles?per_page=30&tag=" + tag;
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "SignalFeed/1.0 (content aggregator; contact: developer@signalfeed.com)");
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            List<Map<String, Object>> articles = response.getBody();

            if (articles == null || articles.isEmpty()) {
                log.warn("Empty response from Dev.to API for tag {}.", tag);
                return Collections.emptyList();
            }

            List<ContentItem> items = new ArrayList<>();

            for (Map<String, Object> article : articles) {
                try {
                    String id = article.get("id").toString();
                    String title = (String) article.get("title");
                    String description = (String) article.get("description");
                    if (description != null && description.length() > 500) {
                        description = description.substring(0, 497) + "...";
                    }

                    String articleUrl = (String) article.get("url");
                    String coverImage = (String) article.get("cover_image");
                    
                    String author = "";
                    Map<String, Object> user = (Map<String, Object>) article.get("user");
                    if (user != null) {
                        author = (String) user.get("name");
                    }

                    List<String> tagList = new ArrayList<>();
                    if (article.containsKey("tag_list")) {
                        Object tagListObj = article.get("tag_list");
                        if (tagListObj instanceof List) {
                            tagList = (List<String>) tagListObj;
                        }
                    }

                    String publishedAtStr = (String) article.get("published_at");
                    LocalDateTime publishedDate = null;
                    if (publishedAtStr != null) {
                        publishedDate = LocalDateTime.ofInstant(Instant.parse(publishedAtStr), ZoneId.of("UTC"));
                    }

                    double positiveReactions = parseDouble(article, "positive_reactions_count");
                    double comments = parseDouble(article, "comments_count");
                    double score = ((positiveReactions * 3.0 + comments * 5.0) / 20.0) * 10.0;
                    double engagementScore = Math.min(score, 100.0);

                    ContentItem item = ContentItem.builder()
                            .externalId(id)
                            .source(Source.DEVTO)
                            .contentType(ContentType.ARTICLE)
                            .title(title)
                            .description(description)
                            .url(articleUrl)
                            .thumbnail(coverImage)
                            .author(author)
                            .category(category)
                            .tags(tagList)
                            .publishedDate(publishedDate)
                            .engagementScore(engagementScore)
                            .build();

                    items.add(item);
                } catch (Exception e) {
                    log.warn("Failed to parse Dev.to article element: {}", e.getMessage());
                }
            }

            return items;
        } catch (Exception e) {
            log.warn("Dev.to Fetcher failed for tag {}: {}", tag, e.getMessage());
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

    private String mapTagToCategory(String tag) {
        return switch (tag.toLowerCase()) {
            case "ai" -> "AI";
            case "java", "webdev" -> "PROGRAMMING";
            case "security" -> "CYBERSECURITY";
            case "productivity", "career" -> "PRODUCTIVITY";
            case "opensource" -> "OPEN_SOURCE";
            case "devops" -> "DEVOPS";
            default -> "PROGRAMMING";
        };
    }
}
