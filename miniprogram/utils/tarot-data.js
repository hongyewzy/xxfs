/**
 * 塔罗牌数据
 */

// 大阿卡纳（22张）
const MAJOR_ARCANA = [
  { name: '愚者', en: 'The Fool', meaning: { upright: '新开始、自由、冒险', reversed: '鲁莽、轻率、不切实际' } },
  { name: '魔术师', en: 'The Magician', meaning: { upright: '创造力、技能、力量', reversed: '欺骗、操控、才能浪费' } },
  { name: '女祭司', en: 'The High Priestess', meaning: { upright: '直觉、神秘、智慧', reversed: '隐藏真相、表面肤浅' } },
  { name: '女皇', en: 'The Empress', meaning: { upright: '丰饶、母性、创造', reversed: '依赖、过度保护、缺乏创造力' } },
  { name: '皇帝', en: 'The Emperor', meaning: { upright: '权威、结构、控制', reversed: '专制、僵化、控制欲过强' } },
  { name: '教皇', en: 'The Hierophant', meaning: { upright: '传统、信仰、教导', reversed: '叛逆、颠覆传统、新观念' } },
  { name: '恋人', en: 'The Lovers', meaning: { upright: '爱情、和谐、选择', reversed: '不和谐、不平衡、错误选择' } },
  { name: '战车', en: 'The Chariot', meaning: { upright: '意志力、胜利、决心', reversed: '失控、攻击性、缺乏方向' } },
  { name: '力量', en: 'Strength', meaning: { upright: '勇气、耐心、内在力量', reversed: '软弱、自我怀疑、缺乏自信' } },
  { name: '隐士', en: 'The Hermit', meaning: { upright: '内省、寻求智慧、孤独', reversed: '孤立、退缩、拒绝帮助' } },
  { name: '命运之轮', en: 'Wheel of Fortune', meaning: { upright: '命运、转折、机遇', reversed: '厄运、抗拒改变、失控' } },
  { name: '正义', en: 'Justice', meaning: { upright: '公正、真理、因果', reversed: '不公、逃避责任、偏见' } },
  { name: '倒吊人', en: 'The Hanged Man', meaning: { upright: '牺牲、等待、新视角', reversed: '拖延、无谓牺牲、抗拒改变' } },
  { name: '死神', en: 'Death', meaning: { upright: '结束、转变、重生', reversed: '抗拒改变、停滞、恐惧' } },
  { name: '节制', en: 'Temperance', meaning: { upright: '平衡、耐心、调和', reversed: '失衡、过度、缺乏耐心' } },
  { name: '恶魔', en: 'The Devil', meaning: { upright: '束缚、欲望、物质', reversed: '解脱、觉醒、克服诱惑' } },
  { name: '高塔', en: 'The Tower', meaning: { upright: '突变、毁灭、觉醒', reversed: '延缓灾难、恐惧改变、逃避危机' } },
  { name: '星星', en: 'The Star', meaning: { upright: '希望、灵感、宁静', reversed: '失望、绝望、失去希望' } },
  { name: '月亮', en: 'The Moon', meaning: { upright: '幻觉、直觉、潜意识', reversed: '混乱、恐惧、自我欺骗' } },
  { name: '太阳', en: 'The Sun', meaning: { upright: '成功、喜悦、活力', reversed: '暂时的挫折、过度乐观' } },
  { name: '审判', en: 'Judgement', meaning: { upright: '觉醒、重生、决断', reversed: '自我怀疑、逃避审判、拒绝改变' } },
  { name: '世界', en: 'The World', meaning: { upright: '完成、圆满、成就', reversed: '未完成、缺乏收尾、寻求结束' } }
]

// 小阿卡纳花色
const SUITS = [
  { name: '权杖', en: 'Wands', element: '火' },
  { name: '圣杯', en: 'Cups', element: '水' },
  { name: '宝剑', en: 'Swords', element: '风' },
  { name: '钱币', en: 'Pentacles', element: '土' }
]

// 小阿卡纳点数
const RANKS = [
  { name: 'A', meaning: '新开始、潜力' },
  { name: '2', meaning: '平衡、选择、合作' },
  { name: '3', meaning: '成长、创造、表达' },
  { name: '4', meaning: '稳定、结构、基础' },
  { name: '5', meaning: '变化、冲突、挑战' },
  { name: '6', meaning: '和谐、平衡、调整' },
  { name: '7', meaning: '评估、反思、选择' },
  { name: '8', meaning: '行动、力量、运动' },
  { name: '9', meaning: '完成、实现、满足' },
  { name: '10', meaning: '圆满、结束、周期' },
  { name: '侍从', meaning: '学习、探索、信息' },
  { name: '骑士', meaning: '行动、追求、进展' },
  { name: '王后', meaning: '内在力量、直觉、成熟' },
  { name: '国王', meaning: '外在力量、权威、掌控' }
]

// 生成完整牌组
function generateDeck() {
  const deck = [...MAJOR_ARCANA.map((card, index) => ({
    name: card.name,
    en: card.en,
    type: 'major',
    index: index,
    meaning: card.meaning
  }))]

  // 添加小阿卡纳
  SUITS.forEach(suit => {
    RANKS.forEach((rank, index) => {
      deck.push({
        name: `${rank.name} ${suit.name}`,
        en: `${rank.name} of ${suit.en}`,
        type: 'minor',
        suit: suit.name,
        element: suit.element,
        rank: rank.name,
        meaning: {
          upright: rank.meaning,
          reversed: '相反含义'
        }
      })
    })
  })

  return deck
}

const FULL_DECK = generateDeck()

/**
 * 洗牌并抽取指定数量
 */
function drawCards(count = 1) {
  const deck = [...FULL_DECK]

  // Fisher-Yates 洗牌
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]
  }

  // 抽牌
  return deck.slice(0, count).map(card => ({
    ...card,
    isReversed: Math.random() > 0.5 // 随机正逆位
  }))
}

/**
 * 获取牌义
 */
function getCardMeaning(card) {
  const meaning = card.isReversed ? card.meaning.reversed : card.meaning.upright
  return `${card.name}（${card.isReversed ? '逆位' : '正位'}）：${meaning}`
}

module.exports = {
  MAJOR_ARCANA,
  SUITS,
  RANKS,
  FULL_DECK,
  drawCards,
  getCardMeaning,
  generateDeck
}
