package com.signalfeed.controller;

import com.signalfeed.dto.TopicClusterDto;
import com.signalfeed.service.TopicClusterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicClusterController {

    private final TopicClusterService topicClusterService;

    @GetMapping
    public ResponseEntity<List<TopicClusterDto>> getTopics(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(topicClusterService.getTopicClusters(pageable));
    }

    @GetMapping("/{topicName}")
    public ResponseEntity<TopicClusterDto> getTopicDetails(
            @PathVariable String topicName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(topicClusterService.getTopicDetails(topicName, pageable));
    }
}
