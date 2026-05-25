package com.pfe.ai.service;

import com.pfe.ai.dto.Alert;
import com.pfe.ai.dto.StudentRiskResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.pfe.ai.dto.RiskPredictionRequest;
import com.pfe.ai.dto.RiskPredictionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskAnalysisService {

    private final WebClient.Builder webClientBuilder;
    private final MlRiskPredictionService mlRiskPredictionService;

    @Value("${services.student-url}")
    private String studentServiceUrl;

    @Value("${services.attendance-url}")
    private String attendanceServiceUrl;

    /**
     * Analyze risk for all students
     */
    public List<StudentRiskResult> analyzeAllStudents() {
        // 1. Get all students
        List<Map<String, Object>> students = webClientBuilder.build()
                .get()
                .uri(studentServiceUrl + "/api/students")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                .block();

        if (students == null || students.isEmpty()) {
            return Collections.emptyList();
        }

        List<StudentRiskResult> results = new ArrayList<>();
        for (Map<String, Object> student : students) {
            Long studentId = toLong(student.get("id"));
            String name = student.get("firstName") + " " + student.get("lastName");
            try {
                StudentRiskResult result = analyzeStudent(studentId, name);
                results.add(result);
            } catch (Exception e) {
                log.warn("Failed to analyze student {}: {}", studentId, e.getMessage());
            }
        }

        return results;
    }

    /**
     * Analyze risk for a single student
     */
    public StudentRiskResult analyzeStudentById(Long studentId) {
        // Get student info
        Map<String, Object> student = webClientBuilder.build()
                .get()
                .uri(studentServiceUrl + "/api/students/" + studentId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (student == null) {
            throw new RuntimeException("Student not found: " + studentId);
        }

        String name = student.get("firstName") + " " + student.get("lastName");
        return analyzeStudent(studentId, name);
    }

    /**
     * Core analysis logic
     */
    private StudentRiskResult analyzeStudent(Long studentId, String name) {
        // Get average grade
        Double average = 0.0;
        try {
            Map<String, Object> avgData = webClientBuilder.build()
                    .get()
                    .uri(studentServiceUrl + "/api/students/" + studentId + "/average")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
            if (avgData != null && avgData.get("average") != null) {
                average = toDouble(avgData.get("average"));
            }
        } catch (Exception e) {
            log.warn("Could not get average for student {}: {}", studentId, e.getMessage());
        }

        // Get attendance stats
        Long totalAbsences = 0L;
        Long totalSessions = 0L;
        Double absenceRate = 0.0;
        try {
            Map<String, Object> stats = webClientBuilder.build()
                    .get()
                    .uri(attendanceServiceUrl + "/api/attendance/student/" + studentId + "/stats")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
            if (stats != null) {
                totalAbsences = toLong(stats.get("absent"));
                totalSessions = toLong(stats.get("totalSessions"));
                absenceRate = toDouble(stats.get("absenceRate"));
            }
        } catch (Exception e) {
            log.warn("Could not get attendance for student {}: {}", studentId, e.getMessage());
        }

        // Fetch other useful data like validated courses, lates, participation if available from other services
        // For now, we will simulate or pass defaults if not available
        Long lateCount = 0L;
        Long validatedCourses = 0L;
        Double participationScore = 80.0; // Default good participation

        RiskPredictionRequest request = RiskPredictionRequest.builder()
                .averageGrade(average)
                .absenceCount(totalAbsences)
                .attendanceRate(100.0 - absenceRate) // Convert absence rate to attendance rate
                .lateCount(lateCount)
                .validatedCourses(validatedCourses)
                .participationScore(participationScore)
                .build();

        RiskPredictionResponse mlResponse = mlRiskPredictionService.predictRisk(request);

        String riskLevel = mlResponse.getRiskLevel();
        String recommendation = mlResponse.getRecommendation();
        
        // Derive category based on features for legacy support
        String riskCategory = "NONE";
        boolean academicRisk = average < 10.0;
        boolean attendanceRisk = totalAbsences > 5;
        if (academicRisk && attendanceRisk) {
            riskCategory = "BOTH";
        } else if (academicRisk) {
            riskCategory = "ACADEMIC";
        } else if (attendanceRisk) {
            riskCategory = "ATTENDANCE";
        }

        return StudentRiskResult.builder()
                .studentId(studentId)
                .studentName(name)
                .average(average)
                .totalAbsences(totalAbsences)
                .totalSessions(totalSessions)
                .absenceRate(absenceRate)
                .riskLevel(riskLevel)
                .riskCategory(riskCategory)
                .recommendation(recommendation)
                .build();
    }

    /**
     * Generate alerts for at-risk students
     */
    public List<Alert> generateAlerts() {
        List<StudentRiskResult> results = analyzeAllStudents();

        return results.stream()
                .filter(r -> !r.getRiskLevel().equals("LOW"))
                .map(r -> Alert.builder()
                        .studentId(r.getStudentId())
                        .studentName(r.getStudentName())
                        .severity(r.getRiskLevel())
                        .message(r.getRecommendation())
                        .category(r.getRiskCategory())
                        .createdAt(LocalDateTime.now())
                        .build())
                .sorted((a, b) -> {
                    Map<String, Integer> priority = Map.of(
                            "CRITICAL", 0, "HIGH", 1, "MEDIUM", 2);
                    return priority.getOrDefault(a.getSeverity(), 3)
                            - priority.getOrDefault(b.getSeverity(), 3);
                })
                .collect(Collectors.toList());
    }

    /**
     * Dashboard summary statistics
     */
    public Map<String, Object> getDashboard() {
        List<StudentRiskResult> results = analyzeAllStudents();

        long totalStudents = results.size();
        long critical = results.stream().filter(r -> r.getRiskLevel().equals("CRITICAL")).count();
        long high = results.stream().filter(r -> r.getRiskLevel().equals("HIGH")).count();
        long medium = results.stream().filter(r -> r.getRiskLevel().equals("MEDIUM")).count();
        long low = results.stream().filter(r -> r.getRiskLevel().equals("LOW")).count();

        double classAverage = results.stream()
                .mapToDouble(StudentRiskResult::getAverage)
                .average().orElse(0.0);

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("totalStudents", totalStudents);
        dashboard.put("classAverage", Math.round(classAverage * 100.0) / 100.0);
        dashboard.put("riskBreakdown", Map.of(
                "critical", critical,
                "high", high,
                "medium", medium,
                "low", low
        ));
        dashboard.put("atRiskCount", critical + high + medium);
        dashboard.put("atRiskPercentage", totalStudents > 0
                ? Math.round((double)(critical + high + medium) / totalStudents * 10000.0) / 100.0
                : 0.0);

        return dashboard;
    }

    private Long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number) return ((Number) value).longValue();
        return Long.parseLong(value.toString());
    }

    private Double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) return ((Number) value).doubleValue();
        return Double.parseDouble(value.toString());
    }
}