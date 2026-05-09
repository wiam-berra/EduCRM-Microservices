package com.pfe.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Alert {
    private Long studentId;
    private String studentName;
    private String severity;       // LOW, MEDIUM, HIGH, CRITICAL
    private String message;
    private String category;
    private LocalDateTime createdAt;
}
