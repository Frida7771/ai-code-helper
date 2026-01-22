import { marked } from 'marked'
import { formatTime, normalizeEnglishSpacing } from '../utils/index.js'

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

export default function ChatMessage({
  message,
  isUser = false,
  timestamp = new Date(),
  onCopy,
  onDownload,
  onRetry,
  isBusy = false
}) {
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
        <div className="message-meta">
          <div className="message-time">{formatTime(timestamp)}</div>
          {!isUser && (
            <div className="message-actions">
              <button
                type="button"
                className="message-action-button"
                onClick={onCopy}
                disabled={isBusy}
              >
                Copy
              </button>
              <button
                type="button"
                className="message-action-button"
                onClick={onDownload}
                disabled={isBusy}
              >
                Download
              </button>
              <button
                type="button"
                className="message-action-button"
                onClick={onRetry}
                disabled={isBusy}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
