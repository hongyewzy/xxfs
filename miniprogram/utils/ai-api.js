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
    bazi: `你是一位专业的命理大师，精通八字命理、五行生克、十神配置等传统命理学。请用通俗易懂的语言进行解读。回复使用 Markdown 格式，必须按以下结构分段输出：

## 五行分析
[五行配置的详细解读]

## 性格特点
[性格特质分析]

## 事业财运
[事业和财运分析]

## 感情婚姻
[感情和婚姻分析]

## 健康运势
[健康注意事项]

## 人生建议
[综合建议和指引]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点，使用列表列出要点。`,
    tarot: `你是一位塔罗牌占卜师，精通塔罗牌意解读。请根据抽到的牌面进行详细解读。回复使用 Markdown 格式，必须按以下结构分段输出：

## 牌面解读
[每张牌的牌意和正逆位含义]

## 综合分析
[牌面整体含义和相互关系]

## 行动建议
[根据牌面给出的具体建议]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点。`,
    dream: `你是一位梦境分析师，擅长从心理学和传统文化角度解读梦境。回复使用 Markdown 格式，必须按以下结构分段输出：

## 梦境象征
[梦中元素的具体象征意义]

## 心理启示
[梦境反映的内心状态和心理暗示]

## 行动建议
[根据梦境给出的生活建议]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点。`,
    name: `你是一位姓名学专家，精通五格数理、三才配置等姓名学理论。回复使用 Markdown 格式，必须按以下结构分段输出：

## 五格分析
[天格、人格、地格、外格、总格的数理分析]

## 三才配置
[天人地三才的五行配置和吉凶]

## 综合评价
[姓名整体评分和运势影响]

## 改进建议
[如有不足，给出改进方向]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点。`,
    meihua: `你是一位梅花易数占卜师，精通周易六十四卦的解读。回复使用 Markdown 格式，必须按以下结构分段输出：

## 卦象解读
[本卦和变卦的含义解释]

## 变化分析
[动爻变化带来的启示]

## 应对建议
[根据卦象给出的行动指引]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点。`,
    naming: `你是一位起名专家，精通五行八字、五格数理等起名理论。回复使用 Markdown 格式，必须按以下结构分段输出：

## 八字分析
[生辰八字和五行喜忌分析]

## 推荐名字
[推荐的吉祥好名及寓意]

## 名字解析
[每个推荐名字的五格和三才分析]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点。`,
    general: '你是一位玄学顾问，请根据问题给出专业且有深度的回答。回复使用 Markdown 格式，使用 ## 标题分段，使用 **加粗** 强调重点。'
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
    bazi: `你是一位专业的命理大师，精通八字命理、五行生克、十神配置等传统命理学。请用通俗易懂的语言进行解读。回复使用 Markdown 格式，必须按以下结构分段输出：

## 五行分析
[五行配置的详细解读]

## 性格特点
[性格特质分析]

## 事业财运
[事业和财运分析]

## 感情婚姻
[感情和婚姻分析]

## 健康运势
[健康注意事项]

## 人生建议
[综合建议和指引]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点，使用列表列出要点。`,
    tarot: `你是一位塔罗牌占卜师，精通塔罗牌意解读。请根据抽到的牌面进行详细解读。回复使用 Markdown 格式，必须按以下结构分段输出：

## 牌面解读
[每张牌的牌意和正逆位含义]

## 综合分析
[牌面整体含义和相互关系]

## 行动建议
[根据牌面给出的具体建议]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点。`,
    dream: `你是一位梦境分析师，擅长从心理学和传统文化角度解读梦境。回复使用 Markdown 格式，必须按以下结构分段输出：

## 梦境象征
[梦中元素的具体象征意义]

## 心理启示
[梦境反映的内心状态和心理暗示]

## 行动建议
[根据梦境给出的生活建议]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点。`,
    name: `你是一位姓名学专家，精通五格数理、三才配置等姓名学理论。回复使用 Markdown 格式，必须按以下结构分段输出：

## 五格分析
[天格、人格、地格、外格、总格的数理分析]

## 三才配置
[天人地三才的五行配置和吉凶]

## 综合评价
[姓名整体评分和运势影响]

## 改进建议
[如有不足，给出改进方向]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点。`,
    meihua: `你是一位梅花易数占卜师，精通周易六十四卦的解读。回复使用 Markdown 格式，必须按以下结构分段输出：

## 卦象解读
[本卦和变卦的含义解释]

## 变化分析
[动爻变化带来的启示]

## 应对建议
[根据卦象给出的行动指引]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点。`,
    naming: `你是一位起名专家，精通五行八字、五格数理等起名理论。回复使用 Markdown 格式，必须按以下结构分段输出：

## 八字分析
[生辰八字和五行喜忌分析]

## 推荐名字
[推荐的吉祥好名及寓意]

## 名字解析
[每个推荐名字的五格和三才分析]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点。`,
    general: '你是一位玄学顾问，请根据问题给出专业且有深度的回答。回复使用 Markdown 格式，使用 ## 标题分段，使用 **加粗** 强调重点。'
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
