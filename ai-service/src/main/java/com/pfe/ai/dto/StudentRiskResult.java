package com.pfe.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentRiskResult {
    private Long studentId;
    private String studentName;
    private Double average;
    private Long totalAbsences;
    private Long totalSessions;
    private Double absenceRate;
    private String riskLevel;      // LOW, MEDIUM, HIGH, CRITICAL
    private String riskCategory;   // NONE, ACADEMIC, ATTENDANCE, BOTH
    private String recommendation;
}
