package com.yupi.aicodehelper.ai.rag;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.splitter.DocumentByParagraphSplitter;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * RAG Configuration with OpenAI Embeddings
 */
@Configuration
public class RagConfig {

    @Resource
    private EmbeddingModel openAiEmbeddingModel;

    @Resource
    private EmbeddingStore<TextSegment> embeddingStore;

    @Bean
    public ContentRetriever contentRetriever() {
        // 1. Load documents
        List<Document> documents = FileSystemDocumentLoader.loadDocuments("src/main/resources/docs");
        // 2. Split documents by paragraph, max 1000 chars, 200 char overlap
        DocumentByParagraphSplitter paragraphSplitter = new DocumentByParagraphSplitter(1000, 200);
        // 3. Ingest documents
        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                .documentSplitter(paragraphSplitter)
                .textSegmentTransformer(textSegment -> TextSegment.from(
                        textSegment.metadata().getString("file_name") + "\n" + textSegment.text(),
                        textSegment.metadata()
                ))
                .embeddingModel(openAiEmbeddingModel)
                .embeddingStore(embeddingStore)
                .build();
        ingestor.ingest(documents);
        // 4. Create content retriever
        ContentRetriever contentRetriever = EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(openAiEmbeddingModel)
                .maxResults(5)
                .minScore(0.75)
                .build();
        return contentRetriever;
    }
}
