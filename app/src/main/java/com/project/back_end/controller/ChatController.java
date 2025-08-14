package com.project.back_end.controller;

import com.project.back_end.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final OpenAIService openAIService;

    @Autowired
    public ChatController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    @PostMapping("/message")
    public ResponseEntity<Map<String, Object>> processChatMessage(@RequestBody Map<String, Object> request) {
        try {
            String userMessage = (String) request.get("message");
            String systemPrompt = (String) request.get("systemPrompt");
            @SuppressWarnings("unchecked")
            List<Map<String, String>> conversationHistory = (List<Map<String, String>>) request.get("history");

            if (userMessage == null || userMessage.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Message cannot be empty");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Map<String, Object> response = openAIService.processChatMessage(userMessage, systemPrompt, conversationHistory);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error processing message: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
