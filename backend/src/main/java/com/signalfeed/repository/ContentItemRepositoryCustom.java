package com.signalfeed.repository;

import com.signalfeed.dto.SearchResultDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface ContentItemRepositoryCustom {
    Page<SearchResultDto> search(
        String query,
        String source,
        String category,
        String contentType,
        LocalDateTime dateFrom,
        LocalDateTime dateTo,
        String sortBy,
        Pageable pageable
    );
}
