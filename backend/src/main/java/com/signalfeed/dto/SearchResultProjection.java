package com.signalfeed.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public interface SearchResultProjection {
    UUID getId();
    String getTitle();
    String getDescription();
    String getUrl();
    String getThumbnail();
    String getSource();
    String getContentType();
    String getAuthor();
    String getCategory();
    String[] getTags();
    LocalDateTime getPublishedDate();
    Double getEngagementScore();
    String getTitleHighlight();
}
