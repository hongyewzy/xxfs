/**
 * Markdown 转 HTML 解析器 - 简单版
 */

function parseMarkdown(text) {
  if (!text) return ''

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // 加粗
  html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')

  // 代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 分割线
  html = html.replace(/^---+$/gm, '<hr>')
  html = html.replace(/^\*\*\*+$/gm, '<hr>')

  // 换行
  html = html.replace(/\n\n+/g, '\n')
  html = html.replace(/\n/g, '<br>')

  return html
}

module.exports = {
  parseMarkdown
}
