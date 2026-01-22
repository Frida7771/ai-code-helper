package com.yupi.aicodehelper.ai;

import dev.langchain4j.rag.content.Content;
import dev.langchain4j.service.Result;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AiCodeHelperServiceTest {

    @Resource
    private AiCodeHelperService aiCodeHelperService;

    @Test
    void chat() {
        String result = aiCodeHelperService.chat("Hi, I'm a software engineer.");
        System.out.println(result);
    }

    @Test
    void chatWithMemory() {
        String result = aiCodeHelperService.chat("Hi, I'm a software engineer.");
        System.out.println(result);
        result = aiCodeHelperService.chat("What was my name again?");
        System.out.println(result);
    }

    @Test
    void chatForReport() {
        String userMessage = "Hi, I've been learning programming for 2.5 years. Please generate a learning report.";
        AiCodeHelperService.Report report = aiCodeHelperService.chatForReport(userMessage);
        System.out.println(report);
    }

    @Test
    void chatWithRag() {
        Result<String> result = aiCodeHelperService.chatWithRag("How should I learn Java? What are common interview questions?");
        String content = result.content();
        List<Content> sources = result.sources();
        System.out.println(content);
        System.out.println(sources);
    }

    @Test
    void chatWithTools() {
        String result = aiCodeHelperService.chat("What are common computer networking interview questions?");
        System.out.println(result);
    }

    @Test
    void chatWithMcp() {
        String result = aiCodeHelperService.chat("What is Codefather?");
        System.out.println(result);
    }

    @Test
    void chatWithGuardrail() {
        String result = aiCodeHelperService.chat("kill the game");
        System.out.println(result);
    }
}
