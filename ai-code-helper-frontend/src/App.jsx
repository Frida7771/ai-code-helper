import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ChatMessage from './components/ChatMessage.jsx'
import ChatInput from './components/ChatInput.jsx'
import LoadingDots from './components/LoadingDots.jsx'
import { chatWithSSE } from './api/chatApi.js'
import { generateMemoryId, normalizeEnglishSpacing } from './utils/index.js'
import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true,
  sanitize: false,
  highlight: function highlight(code) {
    return code
  }
})

export default function App() {
  const [messages, setMessages] = useState([])
  const [memoryId, setMemoryId] = useState(null)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentAiResponse, setCurrentAiResponse] = useState('')
  const [connectionError, setConnectionError] = useState(false)

  const messagesContainerRef = useRef(null)
  const eventSourceRef = useRef(null)
  const responseBufferRef = useRef('')

  const currentAiResponseRendered = useMemo(() => {
    if (!currentAiResponse) return ''
    return marked(normalizeEnglishSpacing(currentAiResponse))
  }, [currentAiResponse])

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [])

  const addMessage = useCallback((content, isUser = false) => {
    const message = {
      id: Date.now() + Math.random(),
      content,
      isUser,
      timestamp: new Date()
    }
    setMessages((prev) => [...prev, message])
  }, [])

  const finishAiResponse = useCallback(() => {
    setIsStreaming(false)

    const finalResponse = responseBufferRef.current.trim()
    if (finalResponse) {
      addMessage(finalResponse, false)
    }

    setIsAiTyping(false)
    setCurrentAiResponse('')
    responseBufferRef.current = ''
    setConnectionError(false)

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [addMessage])

  const handleAiMessage = useCallback((data) => {
    responseBufferRef.current += data
    setCurrentAiResponse(responseBufferRef.current)
  }, [])

  const handleAiError = useCallback((error) => {
    console.error('AI response error:', error)
    setConnectionError(true)
    finishAiResponse()

    setTimeout(() => {
      setConnectionError(false)
    }, 5000)
  }, [finishAiResponse])

  const handleAiClose = useCallback(() => {
    finishAiResponse()
  }, [finishAiResponse])

  const startAiResponse = useCallback((userMessage) => {
    setIsAiTyping(true)
    setIsStreaming(true)
    setCurrentAiResponse('')
    responseBufferRef.current = ''
    setConnectionError(false)

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    eventSourceRef.current = chatWithSSE(
      memoryId,
      userMessage,
      handleAiMessage,
      handleAiError,
      handleAiClose
    )
  }, [memoryId, handleAiMessage, handleAiError, handleAiClose])

  const sendMessage = useCallback((message) => {
    addMessage(message, true)
    startAiResponse(message)
  }, [addMessage, startAiResponse])

  useEffect(() => {
    const id = generateMemoryId()
    setMemoryId(id)
    console.log('Chat session ID:', id)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentAiResponse, isAiTyping, scrollToBottom])

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">AI Code Helper</h1>
        <div className="app-subtitle">Get help with programming and interview preparation</div>
      </div>

      <div className="chat-container">
        <div className="messages-container" ref={messagesContainerRef}>
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-content">
                <div className="welcome-icon">🤖</div>
                <h2>Welcome to AI Code Helper</h2>
                <p>I can help you with:</p>
                <ul>
                  <li>Programming questions and explanations</li>
                  <li>Code examples and best practices</li>
                  <li>Interview preparation support</li>
                  <li>Learning roadmaps and guidance</li>
                </ul>
                <p>Ask me anything!</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}

          {isAiTyping && (
            <div className="chat-message ai-message">
              <div className="message-avatar">
                <div className="avatar ai-avatar">AI</div>
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <div className="ai-typing-content">
                    <div
                      className="ai-response-text message-markdown"
                      dangerouslySetInnerHTML={{ __html: currentAiResponseRendered }}
                    />
                    {isStreaming && <LoadingDots />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <ChatInput
          disabled={isAiTyping}
          onSendMessage={sendMessage}
          placeholder="Ask a programming question..."
        />
      </div>

      {connectionError && (
        <div className="connection-error">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span>Connection failed. Please make sure the backend is running.</span>
          </div>
        </div>
      )}
    </div>
  )
}

