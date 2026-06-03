package com.signalfeed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.UUID;

@Data
public class InteractionRequest {

    @NotNull(message = "Content ID is required")
    private UUID contentId;

    @NotBlank(message = "Interaction value is required")
    @Pattern(regexp = "VIEW|BOOKMARK|WATCH_LATER|READ_LATER|FAVORITE|DISMISS", 
             message = "Interaction must be one of VIEW, BOOKMARK, WATCH_LATER, READ_LATER, FAVORITE, DISMISS")
    private String interaction;

    private String collectionName;
}
