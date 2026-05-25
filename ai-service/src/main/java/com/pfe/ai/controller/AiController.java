package com.pfe.ai.controller;

import com.pfe.ai.dto.Alert;
import com.pfe.ai.dto.ChatRequest;
import com.pfe.ai.dto.StudentRiskResult;
import com.pfe.ai.service.ChatbotService;
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
    private final ChatbotService chatbotService;
    private final com.pfe.ai.service.MlRiskPredictionService mlRiskPredictionService;

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

    @PostMapping("/predict-risk")
    public ResponseEntity<com.pfe.ai.dto.RiskPredictionResponse> predictRisk(@RequestBody com.pfe.ai.dto.RiskPredictionRequest request) {
        return ResponseEntity.ok(mlRiskPredictionService.predictRisk(request));
    }

    // ─── Nouveau endpoint pour le chatbot accessible ───────────────────────
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody ChatRequest request) {
        String reply = chatbotService.chat(request);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}