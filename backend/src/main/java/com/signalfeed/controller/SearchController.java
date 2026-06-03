package com.signalfeed.controller;

import com.signalfeed.dto.SearchResponse;
import com.signalfeed.dto.SearchResultDto;
import com.signalfeed.repository.ContentItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final ContentItemRepository contentItemRepository;

    @GetMapping
    public ResponseEntity<SearchResponse> search(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, name = "contentType") String contentType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false, defaultValue = "relevance") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SearchResultDto> results = contentItemRepository.search(
                q, source, category, contentType, dateFrom, dateTo, sortBy, pageable
        );

        // Group results by contentType
        Map<String, List<SearchResultDto>> groups = new HashMap<>();
        groups.put("VIDEO", new ArrayList<>());
        groups.put("DISCUSSION", new ArrayList<>());
        groups.put("ARTICLE", new ArrayList<>());

        Map<String, List<SearchResultDto>> mappedGroups = results.getContent().stream()
                .filter(item -> item.getContentType() != null)
                .collect(Collectors.groupingBy(SearchResultDto::getContentType));

        for (Map.Entry<String, List<SearchResultDto>> entry : mappedGroups.entrySet()) {
            groups.put(entry.getKey().toUpperCase(), entry.getValue());
        }

        SearchResponse response = SearchResponse.builder()
                .totalResults(results.getTotalElements())
                .query(q)
                .groups(groups)
                .build();

        return ResponseEntity.ok(response);
    }
}
