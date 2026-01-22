import { marked } from 'marked'
import { formatTime, normalizeEnglishSpacing } from '../utils/index.js'

marked.setOptions({
  breaks: true,
  gfm: true,
  sanitize: false,
  highlight: function highlight(code) {
    return code
  }
})

export default function ChatMessage({ message, isUser = false, timestamp = new Date() }) {
  const renderedMessage = isUser ? message : marked(normalizeEnglishSpacing(message))

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        <div className={`avatar ${isUser ? 'user-avatar' : 'ai-avatar'}`}>
          {isUser ? 'You' : 'AI'}
        </div>
      </div>
      <div className="message-content">
        <div className="message-bubble">
          {isUser ? (
            <pre className="message-text">{message}</pre>
          ) : (
            <div
              className="message-markdown"
              dangerouslySetInnerHTML={{ __html: renderedMessage }}
            />
          )}
        </div>
        <div className="message-time">{formatTime(timestamp)}</div>
      </div>
    </div>
  )
}
