# 🤖 AI Code Helper

> An AI-powered programming learning and interview preparation assistant built with LangChain4j and OpenAI.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![LangChain4j](https://img.shields.io/badge/LangChain4j-1.1.0-blue.svg)](https://github.com/langchain4j/langchain4j)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)

## ✨ Overview

AI Code Helper provides:
- Learning roadmaps and study plans
- Project guidance and best practices
- Job search and interview preparation
- Real-time programming Q&A

## 🧱 Tech Stack

- **Backend**: Java 21 + Spring Boot
- **AI Framework**: LangChain4j
- **LLM**: OpenAI (GPT-4o)
- **Embeddings**: OpenAI (text-embedding-3-small)
- **Frontend**: React + Vite

## 🚀 Quick Start

### Requirements

- Java 21+
- Node.js 16+
- Maven 3.6+
- OpenAI API key

### 1) Backend

```bash
git clone <repository-url>
cd ai-code-helper

# Set API key
export OPENAI_API_KEY=sk-xxxx

# Run backend
mvn spring-boot:run
```

### 2) Frontend

```bash
cd ai-code-helper-frontend
npm install
npm run dev
```

### 3) Access

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8081/api`

## 🧩 Core Modules

- `AiCodeHelperService`: Core chat service
- `AiController`: Streaming chat endpoint
- `RagConfig`: RAG configuration
- `InterviewQuestionTool`: Interview question search
- `SafeInputGuardrail`: Input safety checks

## 🙏 Credits

- Inspired by 程序员鱼皮
- [LangChain4j](https://github.com/langchain4j/langchain4j)
- [OpenAI](https://openai.com/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Vue.js](https://vuejs.org/)
