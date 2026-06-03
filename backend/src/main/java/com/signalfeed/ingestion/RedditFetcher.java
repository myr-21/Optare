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
        log.info("Reddit Ingestion is disabled for the MVP roadmap. Future enhancement.");
        return Collections.emptyList();
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
