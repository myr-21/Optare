package com.signalfeed.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto {
    private UUID id;
    private String title;
    private String description;
    private String url;
    private String thumbnail;
    private String source;
    private String contentType;
    private String author;
    private String category;
    private List<String> tags;
    private LocalDateTime publishedDate;
    private Double engagementScore;
    private String titleHighlight;
}
