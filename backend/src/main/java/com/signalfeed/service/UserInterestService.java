package com.signalfeed.service;

import com.signalfeed.dto.UserInterestDto;
import com.signalfeed.model.InterestWeight;
import com.signalfeed.model.User;
import com.signalfeed.model.UserInterest;
import com.signalfeed.repository.UserInterestRepository;
import com.signalfeed.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserInterestService {

    private final UserInterestRepository userInterestRepository;
    private final UserRepository userRepository;

    private static final Set<String> VALID_CATEGORIES = Set.of(
        "AI", "PROGRAMMING", "CYBERSECURITY", "FINANCE", "STARTUPS",
        "SCIENCE", "PRODUCTIVITY", "GAMING", "PHILOSOPHY", "HEALTH",
        "DESIGN", "POLITICS", "CRYPTO", "DEVOPS", "OPEN_SOURCE"
    );

    public List<UserInterestDto> getUserInterests(UUID userId) {
        List<UserInterest> interests = userInterestRepository.findByUserId(userId);
        return interests.stream()
                .map(ui -> UserInterestDto.builder()
                        .category(ui.getCategory())
                        .weight(ui.getWeight().name())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public List<UserInterestDto> updateUserInterests(UUID userId, List<UserInterestDto> dtoList) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Delete all old interests
        userInterestRepository.deleteByUserId(userId);

        // Save new interests
        List<UserInterest> newInterests = dtoList.stream()
                .filter(dto -> VALID_CATEGORIES.contains(dto.getCategory().toUpperCase()))
                .map(dto -> UserInterest.builder()
                        .user(user)
                        .category(dto.getCategory().toUpperCase())
                        .weight(InterestWeight.valueOf(dto.getWeight().toUpperCase()))
                        .build())
                .toList();

        userInterestRepository.saveAll(newInterests);

        return getUserInterests(userId);
    }

    public List<String> getAvailableCategories() {
        return VALID_CATEGORIES.stream().sorted().collect(Collectors.toList());
    }
}
