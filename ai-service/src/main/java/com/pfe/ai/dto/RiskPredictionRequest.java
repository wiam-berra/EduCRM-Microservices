package com.pfe.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RiskPredictionRequest {
    private Double averageGrade;
    private Long absenceCount;
    private Double attendanceRate;
    private Long lateCount;
    private Long validatedCourses;
    private Double participationScore;
}
