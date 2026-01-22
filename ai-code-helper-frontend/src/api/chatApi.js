import axios from 'axios'

// Base URL for API
const API_BASE_URL = 'http://localhost:8081/api'

/**
 * Call chat endpoint via SSE
 * @param {number} memoryId Chat session ID
 * @param {string} message User message
 * @param {Function} onMessage Callback for incoming chunks
 * @param {Function} onError Error handler
 * @param {Function} onClose Connection close handler
 * @returns {EventSource} EventSource instance (close manually if needed)
 */
export function chatWithSSE(memoryId, message, onMessage, onError, onClose) {
    // Build query params
    const params = new URLSearchParams({
        memoryId: memoryId,
        message: message
    })
    
    // Create EventSource connection
    const eventSource = new EventSource(`${API_BASE_URL}/ai/chat?${params}`)
    
    // Handle incoming messages
    eventSource.onmessage = function(event) {
        try {
            const payload = JSON.parse(event.data)
            if (payload.done) {
                eventSource.close()
                onClose && onClose()
                return
            }
            const decodedChunk = decodeBase64Utf8(payload.chunk || '')
            if (decodedChunk !== '') {
                onMessage(decodedChunk)
            }
        } catch (error) {
            console.error('Failed to parse message:', error)
            onError && onError(error)
        }
    }
    
    // Handle errors
    eventSource.onerror = function(error) {
        console.log('SSE connection state:', eventSource.readyState)
        // Only report error if not closed normally
        if (eventSource.readyState !== EventSource.CLOSED) {
            console.error('SSE connection error:', error)
            onError && onError(error)
        } else {
            console.log('SSE connection closed normally')
        }
        
        // Ensure connection is closed
        if (eventSource.readyState !== EventSource.CLOSED) {
            eventSource.close()
        }
    }
    
    // Handle close
    eventSource.onclose = function() {
        console.log('SSE connection closed')
        onClose && onClose()
    }
    
    return eventSource
}

function decodeBase64Utf8(encoded) {
    if (!encoded) return ''
    const binary = atob(encoded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder('utf-8').decode(bytes)
}

/**
 * Health check for backend service
 * @returns {Promise<boolean>} Whether service is available
 */
export async function checkServiceHealth() {
    try {
        const response = await axios.get(`${API_BASE_URL}/health`, {
            timeout: 5000
        })
        return response.status === 200
    } catch (error) {
        console.error('Health check failed:', error)
        return false
    }
} 