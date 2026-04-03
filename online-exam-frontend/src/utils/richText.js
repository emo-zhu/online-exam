import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'strike',
    'blockquote',
    'ul',
    'ol',
    'li',
    'sub',
    'sup',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'pre',
    'code',
    'a',
    'img'
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height']

export const sanitizeRichText = (html) => {
    return DOMPurify.sanitize(String(html ?? ''), {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false
    })
}

export const htmlToPlainText = (html) => {
    const safeHtml = sanitizeRichText(html)
    if (typeof window === 'undefined') {
        return safeHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    }

    const container = window.document.createElement('div')
    container.innerHTML = safeHtml
    return (container.textContent || '')
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

export const hasMeaningfulRichText = (html) => {
    const safeHtml = sanitizeRichText(html)
    if (/<img\b/i.test(safeHtml)) {
        return true
    }
    return htmlToPlainText(safeHtml).length > 0
}
