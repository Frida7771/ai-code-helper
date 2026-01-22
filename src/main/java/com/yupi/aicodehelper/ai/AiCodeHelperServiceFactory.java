package com.yupi.aicodehelper.ai;

import com.yupi.aicodehelper.ai.tools.InterviewQuestionTool;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.service.AiServices;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiCodeHelperServiceFactory {

    @Resource
    private ChatModel openAiChatModel;

    @Resource
    private StreamingChatModel openAiStreamingChatModel;

    @Resource
    private ContentRetriever contentRetriever;

    @Bean
    public AiCodeHelperService aiCodeHelperService() {
        // Chat memory
        ChatMemory chatMemory = MessageWindowChatMemory.withMaxMessages(10);
        // Build AI Service
        AiCodeHelperService aiCodeHelperService = AiServices.builder(AiCodeHelperService.class)
                .chatModel(openAiChatModel)
                .streamingChatModel(openAiStreamingChatModel)
                .chatMemory(chatMemory)
                .chatMemoryProvider(memoryId ->
                        MessageWindowChatMemory.withMaxMessages(10))
                .contentRetriever(contentRetriever)
                .tools(new InterviewQuestionTool())
                .build();
        return aiCodeHelperService;
    }
}
