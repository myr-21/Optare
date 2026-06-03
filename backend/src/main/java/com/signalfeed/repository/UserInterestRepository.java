package com.signalfeed.repository;

import com.signalfeed.model.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserInterestRepository extends JpaRepository<UserInterest, UUID> {
    List<UserInterest> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
