package com.signalfeed.repository;

import com.signalfeed.dto.SearchResultDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.sql.Array;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;

@Repository
public class ContentItemRepositoryCustomImpl implements ContentItemRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @SuppressWarnings("unchecked")
    @Override
    public Page<SearchResultDto> search(
            String queryStr,
            String source,
            String category,
            String contentType,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            String sortBy,
            Pageable pageable
    ) {
        StringBuilder whereClause = new StringBuilder(" WHERE 1=1");
        Map<String, Object> parameters = new HashMap<>();

        boolean hasQuery = queryStr != null && !queryStr.trim().isEmpty();

        if (hasQuery) {
            whereClause.append(" AND c.search_vector @@ plainto_tsquery('english', :queryStr)");
            parameters.put("queryStr", queryStr);
        }

        if (source != null && !source.trim().isEmpty()) {
            whereClause.append(" AND c.source = :source");
            parameters.put("source", source);
        }

        if (category != null && !category.trim().isEmpty()) {
            whereClause.append(" AND c.category = :category");
            parameters.put("category", category);
        }

        if (contentType != null && !contentType.trim().isEmpty()) {
            whereClause.append(" AND c.content_type = :contentType");
            parameters.put("contentType", contentType);
        }

        if (dateFrom != null) {
            whereClause.append(" AND c.published_date >= :dateFrom");
            parameters.put("dateFrom", dateFrom);
        }

        if (dateTo != null) {
            whereClause.append(" AND c.published_date <= :dateTo");
            parameters.put("dateTo", dateTo);
        }

        // Count query
        String countSql = "SELECT COUNT(*) FROM content_items c" + whereClause.toString();
        Query countQuery = entityManager.createNativeQuery(countSql);
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            countQuery.setParameter(entry.getKey(), entry.getValue());
        }
        long totalElements = ((Number) countQuery.getSingleResult()).longValue();

        if (totalElements == 0) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        // Select query
        StringBuilder selectSql = new StringBuilder();
        selectSql.append("SELECT c.id, c.title, c.description, c.url, c.thumbnail, c.source, c.content_type, c.author, c.category, c.tags, c.published_date, c.engagement_score");
        if (hasQuery) {
            selectSql.append(", ts_headline('english', c.title, plainto_tsquery('english', :queryStr), 'MaxFragments=1, MaxWords=10, MinWords=5') as titleHighlight");
        } else {
            selectSql.append(", c.title as titleHighlight");
        }
        selectSql.append(" FROM content_items c");
        selectSql.append(whereClause);

        // Sorting
        if ("relevance".equalsIgnoreCase(sortBy) && hasQuery) {
            selectSql.append(" ORDER BY ");
            selectSql.append("(CASE WHEN LOWER(c.title) = LOWER(:queryStr) THEN 10.0 ELSE 0.0 END) + ");
            selectSql.append("(CASE WHEN LOWER(c.title) LIKE LOWER(:likeQuery) THEN 5.0 ELSE 0.0 END) + ");
            selectSql.append("ts_rank_cd(c.search_vector, plainto_tsquery('english', :queryStr)) DESC");
        } else if ("date".equalsIgnoreCase(sortBy)) {
            selectSql.append(" ORDER BY c.published_date DESC NULLS LAST");
        } else if ("engagement".equalsIgnoreCase(sortBy)) {
            selectSql.append(" ORDER BY c.engagement_score DESC NULLS LAST");
        } else {
            selectSql.append(" ORDER BY c.published_date DESC NULLS LAST");
        }

        Query selectQuery = entityManager.createNativeQuery(selectSql.toString());
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            selectQuery.setParameter(entry.getKey(), entry.getValue());
        }
        if (hasQuery) {
            selectQuery.setParameter("likeQuery", "%" + queryStr.trim() + "%");
        }

        selectQuery.setFirstResult((int) pageable.getOffset());
        selectQuery.setMaxResults(pageable.getPageSize());

        List<Object[]> results = selectQuery.getResultList();
        List<SearchResultDto> dtos = new ArrayList<>();

        for (Object[] row : results) {
            UUID id = (UUID) row[0];
            String title = (String) row[1];
            String description = (String) row[2];
            String url = (String) row[3];
            String thumbnail = (String) row[4];
            String src = (String) row[5];
            String type = (String) row[6];
            String author = (String) row[7];
            String cat = (String) row[8];
            
            // Map tags array
            List<String> tags = new ArrayList<>();
            if (row[9] != null) {
                if (row[9] instanceof Array sqlArray) {
                    try {
                        String[] arr = (String[]) sqlArray.getArray();
                        if (arr != null) {
                            tags.addAll(Arrays.asList(arr));
                        }
                    } catch (Exception e) {
                        // ignore/fallback
                    }
                } else if (row[9] instanceof String[] strArr) {
                    tags.addAll(Arrays.asList(strArr));
                }
            }

            LocalDateTime publishedDate = null;
            if (row[10] != null) {
                publishedDate = ((Timestamp) row[10]).toLocalDateTime();
            }

            Double engagementScore = 0.0;
            if (row[11] != null) {
                engagementScore = ((Number) row[11]).doubleValue();
            }

            String titleHighlight = (String) row[12];

            dtos.add(SearchResultDto.builder()
                    .id(id)
                    .title(title)
                    .description(description)
                    .url(url)
                    .thumbnail(thumbnail)
                    .source(src)
                    .contentType(type)
                    .author(author)
                    .category(cat)
                    .tags(tags)
                    .publishedDate(publishedDate)
                    .engagementScore(engagementScore)
                    .titleHighlight(titleHighlight)
                    .build());
        }

        return new PageImpl<>(dtos, pageable, totalElements);
    }
}
