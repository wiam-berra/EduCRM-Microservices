package com.pfe.ai.controller;

import com.pfe.ai.dto.Alert;
import com.pfe.ai.dto.StudentRiskResult;
import com.pfe.ai.service.RiskAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final RiskAnalysisService riskAnalysisService;

    @GetMapping("/risk-analysis")
    public ResponseEntity<List<StudentRiskResult>> analyzeAllStudents() {
        return ResponseEntity.ok(riskAnalysisService.analyzeAllStudents());
    }

    @GetMapping("/risk-analysis/{studentId}")
    public ResponseEntity<StudentRiskResult> analyzeStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(riskAnalysisService.analyzeStudentById(studentId));
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<Alert>> getAlerts() {
        return ResponseEntity.ok(riskAnalysisService.generateAlerts());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(riskAnalysisService.getDashboard());
    }
}
