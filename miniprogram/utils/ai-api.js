/**
 * AI API 封装
 */

/**
 * 调用 AI API
 */
async function chat(prompt, type = 'general') {
  const app = getApp()
  const { apiUrl, apiKey, model } = app.globalData.aiConfig

  if (!apiUrl || !apiKey) {
    throw new Error('请先配置 AI API 信息')
  }

  const systemPrompts = {
    bazi: '你是一位专业的命理大师，精通八字命理、五行生克、十神配置等传统命理学。请用通俗易懂的语言进行解读，既要尊重传统命理理论，也要理性分析，避免过于迷信的说法。回复使用纯文本，不要使用 Markdown 格式（如不要用 **加粗**、##标题等），直接分段返回。',
    tarot: '你是一位塔罗牌占卜师，精通塔罗牌意解读。请根据抽到的牌面进行详细解读，包括牌面含义、正逆位解读、综合建议等。回复使用纯文本，不要使用 Markdown 格式，直接分段返回。',
    dream: '你是一位梦境分析师，擅长从心理学和传统文化角度解读梦境。请分析梦境中可能存在的象征意义和心理暗示。回复使用纯文本，不要使用 Markdown 格式。',
    name: '你是一位姓名学专家，精通五格数理、三才配置等姓名学理论。请根据五格数理分析姓名的吉凶，并给出改进建议。回复使用纯文本，不要使用 Markdown 格式。',
    meihua: '你是一位梅花易数占卜师，精通周易六十四卦的解读。请根据卦象分析事物发展趋势和吉凶建议。回复使用纯文本，不要使用 Markdown 格式。',
    naming: '你是一位起名专家，精通五行八字、五格数理等起名理论。请根据生辰八字和五行喜忌推荐吉祥好名。回复使用纯文本，不要使用 Markdown 格式。',
    general: '你是一位玄学顾问，请根据问题给出专业且有深度的回答。回复使用纯文本，不要使用 Markdown 格式。'
  }

  try {
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: apiUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        data: {
          model: model,
          messages: [
            { role: 'system', content: systemPrompts[type] || systemPrompts.general },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        success: resolve,
        fail: reject,
        timeout: 60000
      })
    })

    if (response.statusCode === 200 && response.data.choices) {
      return response.data.choices[0].message.content
    } else {
      console.error('AI API 响应异常:', response)
      throw new Error('AI 服务响应异常，请稍后重试')
    }
  } catch (err) {
    console.error('AI API 调用失败:', err)
    throw new Error(err.message || '网络请求失败，请检查网络连接')
  }
}

/**
 * 流式调用 AI API
 */
async function chatStream(prompt, type, onChunk) {
  const app = getApp()
  const { apiUrl, apiKey, model } = app.globalData.aiConfig

  if (!apiUrl || !apiKey) {
    throw new Error('请先配置 AI API 信息')
  }

  const systemPrompts = {
    bazi: '你是一位专业的命理大师，精通八字命理、五行生克、十神配置等传统命理学。请用通俗易懂的语言进行解读。回复使用 Markdown 格式，合理使用 ## 标题、**加粗**、列表等格式使内容更清晰。',
    tarot: '你是一位塔罗牌占卜师，精通塔罗牌意解读。请根据抽到的牌面进行详细解读。回复使用 Markdown 格式，合理使用 ## 标题、**加粗**、列表等格式。',
    dream: '你是一位梦境分析师，擅长从心理学和传统文化角度解读梦境。回复使用 Markdown 格式。',
    name: '你是一位姓名学专家，精通五格数理、三才配置等姓名学理论。回复使用 Markdown 格式。',
    meihua: '你是一位梅花易数占卜师，精通周易六十四卦的解读。回复使用 Markdown 格式。',
    naming: '你是一位起名专家，精通五行八字、五格数理等起名理论。回复使用 Markdown 格式。',
    general: '你是一位玄学顾问。回复使用 Markdown 格式。'
  }

  // 简化处理：不支持流式则调用普通 chat
  const result = await chat(prompt, type)
  if (onChunk) {
    onChunk(result)
  }
  return result
}

module.exports = {
  chat,
  chatStream
}
