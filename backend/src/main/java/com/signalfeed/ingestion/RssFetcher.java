package com.signalfeed.ingestion;

import com.signalfeed.model.ContentItem;
import com.signalfeed.model.ContentType;
import com.signalfeed.model.Source;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
public class RssFetcher implements ContentFetcher {

    private static final Logger log = LoggerFactory.getLogger(RssFetcher.class);

    private final RestTemplate restTemplate;

    private static class FeedConfig {
        String url;
        String category;

        FeedConfig(String url, String category) {
            this.url = url;
            this.category = category;
        }
    }

    private final List<FeedConfig> feeds = List.of(
        new FeedConfig("https://feeds.feedburner.com/TechCrunch", "STARTUPS"),
        new FeedConfig("https://www.wired.com/feed/rss", "SCIENCE"),
        new FeedConfig("https://feeds.arstechnica.com/arstechnica/index", "SCIENCE"),
        new FeedConfig("https://www.theverge.com/rss/index.xml", "SCIENCE"),
        new FeedConfig("https://feeds.feedburner.com/oreilly/radar", "PROGRAMMING")
    );

    public RssFetcher(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String getSource() {
        return "ARTICLE";
    }

    @Override
    public List<ContentItem> fetch() {
        List<ContentItem> items = new ArrayList<>();

        for (FeedConfig feedConfig : feeds) {
            log.info("Fetching RSS Feed: {} (Category: {})", feedConfig.url, feedConfig.category);
            try {
                // Fetch the feed content using RestTemplate to respect timeout configs
                String xmlContent = restTemplate.getForObject(feedConfig.url, String.class);
                if (xmlContent == null || xmlContent.trim().isEmpty()) {
                    log.warn("Empty content returned from RSS Feed: {}", feedConfig.url);
                    continue;
                }

                SyndFeedInput input = new SyndFeedInput();
                ByteArrayInputStream inputStream = new ByteArrayInputStream(xmlContent.getBytes(StandardCharsets.UTF_8));
                SyndFeed feed = input.build(new XmlReader(inputStream));

                for (SyndEntry entry : feed.getEntries()) {
                    try {
                        String uri = entry.getUri();
                        if (uri == null) {
                            uri = entry.getLink();
                        }
                        if (uri == null) continue;

                        String externalId = sha256(uri);

                        String title = entry.getTitle();
                        String description = "";
                        if (entry.getDescription() != null) {
                            description = entry.getDescription().getValue();
                            if (description != null) {
                                // Strip HTML tags
                                description = description.replaceAll("<[^>]*>", "");
                                description = description.replaceAll("\\s+", " ").trim();
                                if (description.length() > 500) {
                                    description = description.substring(0, 497) + "...";
                                }
                            }
                        }

                        String link = entry.getLink();
                        String author = entry.getAuthor();
                        if (author == null || author.isEmpty()) {
                            author = feed.getTitle();
                        }

                        LocalDateTime publishedDate = LocalDateTime.now(ZoneId.of("UTC"));
                        Date pubDate = entry.getPublishedDate();
                        if (pubDate != null) {
                            publishedDate = LocalDateTime.ofInstant(pubDate.toInstant(), ZoneId.of("UTC"));
                        }

                        ContentItem item = ContentItem.builder()
                                .externalId(externalId)
                                .source(Source.ARTICLE)
                                .contentType(ContentType.ARTICLE)
                                .title(title)
                                .description(description)
                                .url(link)
                                .author(author)
                                .category(feedConfig.category)
                                .tags(Collections.emptyList())
                                .publishedDate(publishedDate)
                                .engagementScore(50.0) // default
                                .build();

                        items.add(item);
                    } catch (Exception e) {
                        log.warn("Failed to parse RSS feed entry from {}: {}", feedConfig.url, e.getMessage());
                    }
                }
            } catch (Exception e) {
                log.warn("RSS Fetcher failed for feed {}: {}", feedConfig.url, e.getMessage());
            }
        }

        return items;
    }

    private String sha256(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            return String.valueOf(text.hashCode());
        }
    }
}
