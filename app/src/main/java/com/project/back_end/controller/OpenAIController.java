package com.project.back_end.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/openai")
public class OpenAIController {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;

    @Value("${openai.max-tokens:300}")
    private int maxTokens;

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getOpenAIConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("model", model);
        config.put("maxTokens", maxTokens);

        // Only indicate if the key is configured, but don't return the actual key
        config.put("apiKeyConfigured", apiKey != null && !apiKey.equals("your_openai_api_key_here"));

        return ResponseEntity.ok(config);
    }
}
