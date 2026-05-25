package com.pfe.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RiskPredictionResponse {
    private String riskLevel;
    private Double confidenceScore;
    private List<String> contributingFactors;
    private String recommendation;
}
