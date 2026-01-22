import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ChatMessage from './components/ChatMessage.jsx'
import ChatInput from './components/ChatInput.jsx'
import LoadingDots from './components/LoadingDots.jsx'
import { chatWithSSE } from './api/chatApi.js'
import { generateMemoryId, normalizeEnglishSpacing } from './utils/index.js'
import { marked } from 'marked'

const renderer = new marked.Renderer()
const normalizeHref = (href) => {
  if (href === null || href === undefined) return ''
  let cleaned = String(href).trim()
  cleaned = cleaned.replace(/[.,;:!?]+$/, '')
  if (cleaned.startsWith('www.')) {
    cleaned = `https://${cleaned}`
  }
  return cleaned
}
renderer.link = function link(token) {
  // marked.js v5+ passes a token object; older versions pass (href, title, text)
  const href = typeof token === 'object' ? token.href : token
  const title = typeof token === 'object' ? token.title : arguments[1]
  const text = typeof token === 'object' ? token.text : arguments[2]
  const safeHref = normalizeHref(href)
  const safeTitle = title ? ` title="${title}"` : ''
  return `<a href="${safeHref}"${safeTitle} target="_blank" rel="noopener noreferrer">${text || ''}</a>`
}

marked.setOptions({
  breaks: true,
  gfm: true,
  sanitize: false,
  renderer,
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

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    finishAiResponse()
  }, [finishAiResponse])

  const handleCopyMessage = useCallback((text) => {
    if (!text) return
    navigator.clipboard?.writeText(text)
      .catch((error) => console.error('Copy failed:', error))
  }, [])

  const handleDownloadMessage = useCallback((text, timestamp) => {
    if (!text) return
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const time = timestamp instanceof Date ? timestamp.toISOString().replace(/[:.]/g, '-') : Date.now()
    link.href = url
    link.download = `ai-response-${time}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

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

  const handleRetryMessage = useCallback((index) => {
    if (isAiTyping) return
    if (index <= 0) return
    const previous = messages[index - 1]
    if (!previous || !previous.isUser) return
    addMessage(previous.content, true)
    startAiResponse(previous.content)
  }, [addMessage, isAiTyping, messages, startAiResponse])

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

          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
              isBusy={isAiTyping}
              onCopy={() => handleCopyMessage(message.content)}
              onDownload={() => handleDownloadMessage(message.content, message.timestamp)}
              onRetry={() => handleRetryMessage(index)}
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

        {isAiTyping && (
          <div className="chat-controls">
            <button
              type="button"
              className="chat-control-button"
              onClick={stopStreaming}
            >
              Stop generating
            </button>
          </div>
        )}
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

