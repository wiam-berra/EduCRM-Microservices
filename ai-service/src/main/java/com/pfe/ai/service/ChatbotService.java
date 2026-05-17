package com.pfe.ai.service;

import com.pfe.ai.dto.ChatRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private static final String GROQ_API_URL =
            "https://api.groq.com/openai/v1/chat/completions";
    private static final String API_KEY = "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"; // 🔑 Remplace ici

    public String chat(ChatRequest request) {
        String systemPrompt = request.getSystemContext() != null
                ? request.getSystemContext()
                : "Tu es un assistant EduCRM. Réponds en français, de manière concise (max 3 phrases).";

        List<Map<String, Object>> messages = new ArrayList<>();

        // Contexte système
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // Historique des messages
        if (request.getMessages() != null) {
            for (ChatRequest.ChatMessage m : request.getMessages()) {
                messages.add(Map.of("role", m.getRole(), "content", m.getContent()));
            }
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", "llama-3.3-70b-versatile");
        body.put("messages", messages);
        body.put("max_tokens", 300);
        body.put("temperature", 0.7);

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(API_KEY); // ✅ Groq utilise Bearer token

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    GROQ_API_URL, entity, Map.class
            );

            Map<?, ?> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                List<?> choices = (List<?>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<?, ?> first = (Map<?, ?>) choices.get(0);
                    Map<?, ?> message = (Map<?, ?>) first.get("message");
                    return (String) message.get("content");
                }
            }

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return "Erreur du service IA : " + e.getStatusCode() + " - " + e.getResponseBodyAsString();
        } catch (Exception e) {
            return "Erreur du service IA : " + e.getMessage();
        }

        return "Je n'ai pas pu obtenir une réponse.";
    }
}