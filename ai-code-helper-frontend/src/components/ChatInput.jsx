import { useEffect, useRef, useState } from 'react'

export default function ChatInput({ disabled = false, placeholder = 'Ask your question...', onSendMessage }) {
  const [inputMessage, setInputMessage] = useState('')
  const inputRef = useRef(null)

  const adjustHeight = () => {
    if (!inputRef.current) return
    const textarea = inputRef.current
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  const sendMessage = () => {
    if (!inputMessage.trim() || disabled) return
    onSendMessage?.(inputMessage.trim())
    setInputMessage('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [inputMessage])

  useEffect(() => {
    adjustHeight()
  }, [])

  return (
    <div className="chat-input">
      <div className="input-container">
        <textarea
          ref={inputRef}
          value={inputMessage}
          placeholder={placeholder}
          disabled={disabled}
          className="input-textarea"
          rows={1}
          onChange={(event) => setInputMessage(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          disabled={disabled || !inputMessage.trim()}
          onClick={sendMessage}
          className="send-button"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  )
}
