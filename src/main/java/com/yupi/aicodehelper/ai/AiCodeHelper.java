package com.yupi.aicodehelper.ai;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AiCodeHelper {

    @Resource
    private ChatModel openAiChatModel;

    private static final String SYSTEM_MESSAGE = """
            You are a programming assistant who helps users with learning and job interview preparation. Focus on four areas:
            1. Provide clear programming learning roadmaps
            2. Offer project ideas and learning guidance
            3. Give end-to-end job search advice (resume optimization, application strategy)
            4. Share common interview questions and interview tips
            Respond in concise, easy-to-understand English to help users learn and prepare efficiently.
            """;

    public String chat(String message) {
        SystemMessage systemMessage = SystemMessage.from(SYSTEM_MESSAGE);
        UserMessage userMessage = UserMessage.from(message);
        ChatResponse chatResponse = openAiChatModel.chat(systemMessage, userMessage);
        AiMessage aiMessage = chatResponse.aiMessage();
        log.info("AI output: " + aiMessage);
        return aiMessage.text();
    }

    public String chatWithMessage(UserMessage userMessage) {
        ChatResponse chatResponse = openAiChatModel.chat(userMessage);
        AiMessage aiMessage = chatResponse.aiMessage();
        log.info("AI output: " + aiMessage);
        return aiMessage.text();
    }
}
