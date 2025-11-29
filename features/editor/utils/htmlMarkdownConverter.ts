/**
 * @feature Editor
 * @description Utility functions for converting between HTML (from rich text editor) and Markdown
 */

/**
 * Converts HTML to Markdown (React Native compatible - no DOM APIs)
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html.trim() === '') {
    return '';
  }
  
  let markdown = html
    // Remove empty paragraphs
    .replace(/<p><br\s*\/?><\/p>/gi, '\n')
    .replace(/<p><\/p>/gi, '\n')
    // Convert <br> tags to newlines
    .replace(/<br\s*\/?>/gi, '\n')
    // Convert <strong> and <b> to **bold**
    .replace(/<(strong|b)>(.*?)<\/\1>/gi, '**$2**')
    // Convert <em> and <i> to *italic*
    .replace(/<(em|i)>(.*?)<\/\1>/gi, '*$2*')
    // Convert list items: <li>item</li> -> - item
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    // Remove <ul> and </ul> tags (list items already converted)
    .replace(/<\/?ul>/gi, '')
    // Remove <ol> and </ol> tags
    .replace(/<\/?ol>/gi, '')
    // Remove paragraph tags but keep content
    .replace(/<\/?p>/gi, '\n')
    // Remove div tags but keep content
    .replace(/<\/?div>/gi, '\n')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();

  return markdown;
}

/**
 * Converts Markdown to HTML for the rich text editor
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown || markdown.trim() === '') {
    return '';
  }

  // Simple markdown to HTML conversion
  let html = markdown
    // Bold: **text** -> <strong>text</strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* -> <em>text</em> (but not **text**)
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
    // List items: - item -> <li>item</li>
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive list items in <ul>
    .replace(/(<li>.*<\/li>(\n|$))+/g, (match) => {
      return '<ul>' + match.replace(/\n/g, '') + '</ul>';
    })
    // Line breaks
    .replace(/\n/g, '<br>');

  // Wrap in paragraph tags if not already wrapped
  if (!html.includes('<p>') && !html.includes('<ul>')) {
    html = `<p>${html}</p>`;
  }

  return html;
}
