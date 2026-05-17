package com.pfe.ai.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatRequest {
    private List<ChatMessage> messages;
    private String systemContext;

    @Data
    public static class ChatMessage {
        private String role;
        private String content;
    }
}