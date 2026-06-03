package com.signalfeed.repository;

import com.signalfeed.model.ContentItem;
import com.signalfeed.model.Source;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContentItemRepository extends JpaRepository<ContentItem, UUID>, ContentItemRepositoryCustom {

    Optional<ContentItem> findBySourceAndExternalId(Source source, String externalId);

    @Query("SELECT c.category FROM ContentItem c WHERE c.createdAt >= :since AND c.category IS NOT NULL GROUP BY c.category ORDER BY COUNT(c) DESC")
    List<String> findTopCategoriesSince(@Param("since") LocalDateTime since, Pageable pageable);

    @Query(value = "SELECT unnest(c.tags) as tag FROM content_items c WHERE c.created_at >= :since GROUP BY tag ORDER BY COUNT(*) DESC", nativeQuery = true)
    List<String> findTopTagsSince(@Param("since") LocalDateTime since, Pageable pageable);

    @Query(value = "SELECT * FROM content_items c WHERE :topic = ANY(c.tags) OR c.category = :topic", nativeQuery = true)
    List<ContentItem> findByTopic(@Param("topic") String topic);

    @Query(value = "SELECT * FROM content_items c WHERE :topic = ANY(c.tags) OR c.category = :topic",
            countQuery = "SELECT COUNT(*) FROM content_items c WHERE :topic = ANY(c.tags) OR c.category = :topic",
            nativeQuery = true)
    Page<ContentItem> findByTopic(@Param("topic") String topic, Pageable pageable);

    // Get count of distinct categories ingested
    @Query("SELECT COUNT(DISTINCT c.category) FROM ContentItem c")
    long countDistinctCategories();
}
