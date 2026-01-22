/**
 * Generate a chat session ID
 * @returns {number} ID within int range
 */
export function generateMemoryId() {
    // Use the last 9 digits of the timestamp to fit int range
    return Math.floor(Date.now() % 1000000000)
}

/**
 * Format time
 * @param {Date} date Date object
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) { // within 1 minute
        return 'Just now'
    } else if (diff < 3600000) { // within 1 hour
        return `${Math.floor(diff / 60000)}m ago`
    } else if (diff < 86400000) { // within 1 day
        return `${Math.floor(diff / 3600000)}h ago`
    } else {
        return date.toLocaleDateString()
    }
}

/**
 * Debounce function
 * @param {Function} func Function to debounce
 * @param {number} wait Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
} 

/**
 * Normalize English spacing in AI responses while keeping code blocks intact.
 * @param {string} text Raw AI response
 * @returns {string} Normalized text
 */
export function normalizeEnglishSpacing(text) {
    if (!text) return text

    const maskedSegments = []
    const mask = (match) => {
        const token = `__MASK_${maskedSegments.length}__`
        maskedSegments.push(match)
        return token
    }

    const normalizeInline = (segment) => {
        // Protect URLs and Markdown links from spacing fixes.
        const protectedSegment = segment
            .replace(/\[[^\]]+\]\([^)]+\)/g, mask)
            .replace(/https?:\/\/[^\s)]+/g, mask)

        const parts = protectedSegment.split(/(`[^`]*`)/g)
        return parts.map((part) => {
            if (part.startsWith('`') && part.endsWith('`')) {
                return part
            }

            let output = part
            output = output.replace(/([.,!?;:])([A-Za-z0-9])/g, '$1 $2')
            output = output.replace(/(^|\n)(\s*#{1,6})([A-Za-z])/g, '$1$2 $3')
            output = output.replace(/(^|\n)(\s*[-*+]|\s*\d+\.)\s*([A-Za-z])/g, '$1$2 $3')
            output = output.replace(/([A-Za-z])\(/g, '$1 (')
            output = output.replace(/\)([A-Za-z])/g, ') $1')
            return output
        }).join('')
    }

    const fenceParts = text.split(/```/g)
    const normalized = fenceParts.map((part, index) => {
        if (index % 2 === 1) {
            return part
        }
        return normalizeInline(part)
    }).join('```')

    return maskedSegments.reduce((current, original, index) => {
        return current.replace(`__MASK_${index}__`, original)
    }, normalized)
}