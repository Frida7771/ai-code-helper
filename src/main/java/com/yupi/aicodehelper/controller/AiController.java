package com.yupi.aicodehelper.controller;

import com.yupi.aicodehelper.ai.AiCodeHelperService;
import jakarta.annotation.Resource;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.nio.charset.StandardCharsets;
import java.util.Base64;


@RestController
@RequestMapping("/ai")
public class AiController {

    @Resource
    private AiCodeHelperService aiCodeHelperService;

    @GetMapping("/chat")
    public Flux<ServerSentEvent<String>> chat(int memoryId, String message) {
        return aiCodeHelperService.chatStream(memoryId, message)
                .map(AiController::encodeChunk)
                .concatWith(Flux.just("{\"done\":true}"))
                .map(chunk -> ServerSentEvent.<String>builder()
                        .data(chunk)
                        .build());
    }

    private static String encodeChunk(String chunk) {
        if (chunk == null) {
            return "{\"chunk\":\"\"}";
        }
        String encoded = Base64.getEncoder()
                .encodeToString(chunk.getBytes(StandardCharsets.UTF_8));
        return "{\"chunk\":\"" + encoded + "\"}";
    }
}
