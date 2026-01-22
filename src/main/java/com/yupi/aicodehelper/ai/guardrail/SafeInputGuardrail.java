package com.yupi.aicodehelper.ai.guardrail;

import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.guardrail.InputGuardrail;
import dev.langchain4j.guardrail.InputGuardrailResult;

import java.util.Set;

/**
 * Input safety guardrail
 */
public class SafeInputGuardrail implements InputGuardrail {

    private static final Set<String> sensitiveWords = Set.of("kill", "evil");

    /**
     * Validate user input for safety
     */
    @Override
    public InputGuardrailResult validate(UserMessage userMessage) {
        // Get user input and lowercase it for case-insensitive checks
        String inputText = userMessage.singleText().toLowerCase();
        // Split input into words using regex
        String[] words = inputText.split("\\W+");
        // Check each word against the sensitive list
        for (String word : words) {
            if (sensitiveWords.contains(word)) {
                return fatal("Sensitive word detected: " + word);
            }
        }
        return success();
    }
}
