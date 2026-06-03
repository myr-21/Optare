package com.signalfeed.repository;

import com.signalfeed.model.ContentItem;
import com.signalfeed.model.InteractionType;
import com.signalfeed.model.Source;
import com.signalfeed.model.UserInteraction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, UUID> {

    Optional<UserInteraction> findByUserIdAndContentItemIdAndInteraction(UUID userId, UUID contentId, InteractionType interaction);

    void deleteByUserIdAndContentItemIdAndInteraction(UUID userId, UUID contentId, InteractionType interaction);

    @Query("SELECT DISTINCT ui.collectionName FROM UserInteraction ui WHERE ui.user.id = :userId AND ui.collectionName IS NOT NULL ORDER BY ui.collectionName")
    List<String> findDistinctCollectionNamesByUserId(@Param("userId") UUID userId);

    @Query("SELECT ui.contentItem FROM UserInteraction ui WHERE ui.user.id = :userId AND ui.interaction = :type")
    Page<ContentItem> findSavedContentByInteractionType(@Param("userId") UUID userId, @Param("type") InteractionType type, Pageable pageable);

    @Query("SELECT ui.contentItem FROM UserInteraction ui WHERE ui.user.id = :userId AND ui.interaction = :type AND ui.collectionName = :collectionName")
    Page<ContentItem> findSavedContentByInteractionTypeAndCollection(@Param("userId") UUID userId, @Param("type") InteractionType type, @Param("collectionName") String collectionName, Pageable pageable);

    @Query("SELECT ui.contentItem.id FROM UserInteraction ui WHERE ui.user.id = :userId AND ui.interaction IN :interactions")
    List<UUID> findContentIdsByUserIdAndInteractions(@Param("userId") UUID userId, @Param("interactions") Collection<InteractionType> interactions);

    @Query("SELECT DISTINCT ui.contentItem.category FROM UserInteraction ui WHERE ui.user.id = :userId AND ui.interaction IN :interactions AND ui.contentItem.category IS NOT NULL")
    List<String> findDistinctSavedCategoriesByUserIdAndInteractions(@Param("userId") UUID userId, @Param("interactions") Collection<InteractionType> interactions);

    @Query("SELECT ui.contentItem.source FROM UserInteraction ui WHERE ui.user.id = :userId AND ui.interaction = 'VIEW' ORDER BY ui.createdAt DESC")
    List<Source> findLastViewedSourcesByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT ui.contentItem.category FROM UserInteraction ui WHERE ui.user.id = :userId AND ui.interaction = 'VIEW' ORDER BY ui.createdAt DESC")
    List<String> findLastViewedCategoriesByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT COUNT(ui) FROM UserInteraction ui WHERE ui.user.id = :userId AND ui.interaction = 'VIEW'")
    long countViewedByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(ui) FROM UserInteraction ui WHERE ui.user.id = :userId AND ui.interaction IN :savedTypes")
    long countSavedByUserId(@Param("userId") UUID userId, @Param("savedTypes") Collection<InteractionType> savedTypes);

    @Query(value = "SELECT CAST(ui.created_at AS DATE) as activityDate, COUNT(*) as activityCount " +
                   "FROM user_interactions ui " +
                   "WHERE ui.user_id = :userId AND ui.created_at >= CURRENT_DATE - INTERVAL '14 days' " +
                   "GROUP BY activityDate ORDER BY activityDate ASC", nativeQuery = true)
    List<Object[]> findActivityByDayLast14Days(@Param("userId") UUID userId);
}
