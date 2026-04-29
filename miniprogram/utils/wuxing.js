/**
 * 五行算法
 */

// 五行
const WUXING = ['金', '木', '水', '火', '土']

// 五行相生
const SHENG = {
  '金': '水', // 金生水
  '水': '木', // 水生木
  '木': '火', // 木生火
  '火': '土', // 火生土
  '土': '金'  // 土生金
}

// 五行相克
const KE = {
  '金': '木', // 金克木
  '木': '土', // 木克土
  '土': '水', // 土克水
  '水': '火', // 水克火
  '火': '金'  // 火克金
}

// 天干五行
const GAN_WUXING = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
}

// 地支五行
const ZHI_WUXING = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
}

// 五行颜色
const WUXING_COLOR = {
  '金': '#c0c0c0',
  '木': '#228b22',
  '水': '#1e90ff',
  '火': '#dc143c',
  '土': '#daa520'
}

// 五行方位
const WUXING_DIRECTION = {
  '金': '西',
  '木': '东',
  '水': '北',
  '火': '南',
  '土': '中'
}

/**
 * 天干转五行
 */
function ganToWuxing(gan) {
  return GAN_WUXING[gan] || ''
}

/**
 * 地支转五行
 */
function zhiToWuxing(zhi) {
  return ZHI_WUXING[zhi] || ''
}

/**
 * 五行相生关系
 * @returns {string} '生' | '被生' | '克' | '被克' | '同'
 */
function wuxingRelation(a, b) {
  if (a === b) return '同'
  if (SHENG[a] === b) return '生'
  if (SHENG[b] === a) return '被生'
  if (KE[a] === b) return '克'
  if (KE[b] === a) return '被克'
  return ''
}

/**
 * 判断是否相生
 */
function isSheng(a, b) {
  return SHENG[a] === b
}

/**
 * 判断是否相克
 */
function isKe(a, b) {
  return KE[a] === b
}

/**
 * 获取生我的五行
 */
function getShengMe(wx) {
  for (const key in SHENG) {
    if (SHENG[key] === wx) return key
  }
  return ''
}

/**
 * 获取我生的五行
 */
function getWoSheng(wx) {
  return SHENG[wx] || ''
}

/**
 * 获取克我的五行
 */
function getKeMe(wx) {
  for (const key in KE) {
    if (KE[key] === wx) return key
  }
  return ''
}

/**
 * 获取我克的五行
 */
function getWoKe(wx) {
  return KE[wx] || ''
}

/**
 * 统计五行数量
 */
function countWuxing(ganzhiList) {
  const count = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }

  ganzhiList.forEach(gz => {
    // 判断是天干还是地支
    if (GAN_WUXING[gz]) {
      count[GAN_WUXING[gz]]++
    } else if (ZHI_WUXING[gz]) {
      count[ZHI_WUXING[gz]]++
    }
  })

  return count
}

/**
 * 分析五行强弱
 */
function analyzeWuxing(count) {
  const total = Object.values(count).reduce((a, b) => a + b, 0)
  const avg = total / 5

  const result = []
  for (const wx of WUXING) {
    const num = count[wx] || 0
    let strength = '平'
    if (num > avg * 1.5) strength = '旺'
    else if (num > avg) strength = '相'
    else if (num < avg * 0.5) strength = '弱'
    else if (num < avg) strength = '休'

    result.push({
      name: wx,
      count: num,
      strength,
      percent: Math.round(num / total * 100)
    })
  }

  return result.sort((a, b) => b.count - a.count)
}

/**
 * 获取喜用神（简化版）
 * 根据日主五行和月令判断
 */
function getXiyong(dayGan, monthZhi) {
  const dayWx = ganToWuxing(dayGan)
  const monthWx = zhiToWuxing(monthZhi)

  // 简化判断：生于旺月则喜克泄，生于弱月则喜生扶
  const relation = wuxingRelation(monthWx, dayWx)

  let xi, yong
  if (relation === '同' || relation === '被生') {
    // 身旺，喜克泄
    xi = getWoKe(dayWx) // 喜官杀
    yong = getWoSheng(dayWx) // 用食伤
  } else {
    // 身弱，喜生扶
    xi = getShengMe(dayWx) // 喜印
    yong = dayWx // 用比劫
  }

  return { xi, yong }
}

module.exports = {
  WUXING,
  SHENG,
  KE,
  GAN_WUXING,
  ZHI_WUXING,
  WUXING_COLOR,
  WUXING_DIRECTION,
  ganToWuxing,
  zhiToWuxing,
  wuxingRelation,
  isSheng,
  isKe,
  getShengMe,
  getWoSheng,
  getKeMe,
  getWoKe,
  countWuxing,
  analyzeWuxing,
  getXiyong
}
