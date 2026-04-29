/**
 * Markdown 转 HTML 解析器 - 关键词高亮版
 */

// 命理关键词
const KEYWORDS = [
  // 五行
  '金', '木', '水', '火', '土',
  '金行', '木行', '水行', '火行', '土行',
  // 十神
  '正官', '偏官', '正财', '偏财', '正印', '偏印', '食神', '伤官', '比肩', '劫财',
  // 格局
  '身旺', '身弱', '日主旺衰', '用神', '忌神', '喜神', '仇神', '闲神',
  '官杀', '财星', '印星', '食伤', '比劫',
  '从弱', '从强', '化气', '专旺',
  // 大运
  '大运', '流年', '岁运', '运势',
  // 其他
  '命宫', '胎元', '身宫', '福元', '事业', '财运', '感情', '健康',
  '贵人', '小人', '姻缘', '桃花', '婚姻'
]

// 需要高亮的正则模式
const keywordPattern = new RegExp(`(${KEYWORDS.join('|')})`, 'g')

/**
 * 解析关键词并高亮
 */
function highlightKeywords(text) {
  if (!text) return text
  // 避免重复高亮（已有mark标签的不再处理）
  if (text.includes('<mark>')) return text
  return text.replace(keywordPattern, '<mark>$1</mark>')
}

function parseMarkdown(text) {
  if (!text) return ''

  let html = text
    // 转义 HTML 特殊字符
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 先处理有序列表（必须在无序列表之前）
  html = html.replace(/^(\d+)\. (.+)$/gm, (match, num, content) => {
    return `<li data-num="${num}">${content}</li>`
  })

  // 处理无序列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')

  // 将连续的 <li> 用 <ul> 包裹（有序列表）
  html = html.replace(/(<li data-num="\d+">.*?<\/li>\n?)+/g, (match) => {
    return '<ol>' + match + '</ol>'
  })

  // 将连续的 <li> 用 <ul> 包裹（无序列表）
  html = html.replace(/(<li>(?!.*data-num).*?<\/li>\n?)+/g, (match) => {
    if (match.includes('data-num')) return match
    return '<ul>' + match + '</ul>'
  })

  // 标题 ## 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // 加粗 **text** 或 __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // 斜体 *text* 或 _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')

  // 删除线 ~~text~~
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // 行内代码 `code`
  html = html.replace(/`(.+?)`/g, '<code class="inline-code">$1</code>')

  // 分割线 --- 或 ***
  html = html.replace(/^---+$/gm, '<hr>')
  html = html.replace(/^\*\*\*+$/gm, '<hr>')

  // 换行处理
  html = html.replace(/\n\n+/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')

  // 包裹段落
  html = '<p>' + html + '</p>'

  // 清理空段落和不需要的 p 标签
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p>(<h[1-6]>)/g, '$1')
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
  html = html.replace(/<p>(<ul>)/g, '$1')
  html = html.replace(/(<\/ul>)<\/p>/g, '$1')
  html = html.replace(/<p>(<ol>)/g, '$1')
  html = html.replace(/(<\/ol>)<\/p>/g, '$1')
  html = html.replace(/<p>(<hr>)/g, '$1')
  html = html.replace(/(<hr>)<\/p>/g, '$1')
  html = html.replace(/<p>(<strong>)/g, '$1')
  html = html.replace(/(<\/strong>)<\/p>/g, '$1')

  // 关键词高亮（在最后处理，避免其他标签被破坏）
  html = html.replace(/(<[^>]+>)([^<]+)(<[^>]+>)/g, (match, prefix, content, suffix) => {
    // 跳过已处理的标签内容
    if (prefix.includes('h1') || prefix.includes('h2') || prefix.includes('h3') ||
        prefix.includes('mark') || prefix.includes('strong') || prefix.includes('code')) {
      return match
    }
    const highlighted = highlightKeywords(content)
    return prefix + highlighted + suffix
  })

  // 处理连续的 p 标签中的关键词
  html = html.replace(/<p>(.+?)<\/p>/g, (match, content) => {
    if (content.includes('<h') || content.includes('<ul') || content.includes('<ol') ||
        content.includes('<hr') || content.includes('<mark')) {
      return match
    }
    const highlighted = highlightKeywords(content)
    return '<p>' + highlighted + '</p>'
  })

  return html
}

module.exports = {
  parseMarkdown
}
