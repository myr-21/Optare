package com.signalfeed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInterestDto {

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Weight is required")
    @Pattern(regexp = "HIGH|MEDIUM|LOW|IGNORE", message = "Weight must be one of HIGH, MEDIUM, LOW, IGNORE")
    private String weight;
}
