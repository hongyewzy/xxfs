/**
 * 梅花易数算法
 */

// 八卦
const BAGUA = [
  { name: '乾', symbol: '☰', nature: '天', wuxing: '金' },
  { name: '兑', symbol: '☱', nature: '泽', wuxing: '金' },
  { name: '离', symbol: '☲', nature: '火', wuxing: '火' },
  { name: '震', symbol: '☳', nature: '雷', wuxing: '木' },
  { name: '巽', symbol: '☴', nature: '风', wuxing: '木' },
  { name: '坎', symbol: '☵', nature: '水', wuxing: '水' },
  { name: '艮', symbol: '☶', nature: '山', wuxing: '土' },
  { name: '坤', symbol: '☷', nature: '地', wuxing: '土' }
]

// 八卦数字对应（先天数）
const XIAN_TIAN_SHU = {
  '乾': 1, '兑': 2, '离': 3, '震': 4,
  '巽': 5, '坎': 6, '艮': 7, '坤': 8
}

// 数字对应八卦
const SHU_TO_GUA = {
  1: '乾', 2: '兑', 3: '离', 4: '震',
  5: '巽', 6: '坎', 7: '艮', 8: '坤'
}

// 六十四卦
const LIUSHISI_GUA = {
  '乾乾': '乾为天', '乾兑': '天泽履', '乾离': '天火同人', '乾震': '天雷无妄',
  '乾巽': '天风姤', '乾坎': '天水讼', '乾艮': '天山遁', '乾坤': '天地否',
  '兑乾': '泽天夬', '兑兑': '兑为泽', '兑离': '泽火革', '兑震': '泽雷随',
  '兑巽': '泽风大过', '兑坎': '泽水困', '兑艮': '泽山咸', '兑坤': '泽地萃',
  '离乾': '火天大有', '离兑': '火泽睽', '离离': '离为火', '离震': '火雷噬嗑',
  '离巽': '火风鼎', '离坎': '火水未济', '离艮': '火山旅', '离坤': '火地晋',
  '震乾': '雷天大壮', '震兑': '雷泽归妹', '震离': '雷火丰', '震震': '震为雷',
  '震巽': '雷风恒', '震坎': '雷水解', '震艮': '雷山小过', '震坤': '雷地豫',
  '巽乾': '风天小畜', '巽兑': '风泽中孚', '巽离': '风火家人', '巽震': '风雷益',
  '巽巽': '巽为风', '巽坎': '风水涣', '巽艮': '风山渐', '巽坤': '风地观',
  '坎乾': '水天需', '坎兑': '水泽节', '坎离': '水火既济', '坎震': '水雷屯',
  '坎巽': '水风井', '坎坎': '坎为水', '坎艮': '水山蹇', '坎坤': '水地比',
  '艮乾': '山天大畜', '艮兑': '山泽损', '艮离': '山火贲', '艮震': '山雷颐',
  '艮巽': '山风蛊', '艮坎': '山水蒙', '艮艮': '艮为山', '艮坤': '山地剥',
  '坤乾': '地天泰', '坤兑': '地泽临', '坤离': '地火明夷', '坤震': '地雷复',
  '坤巽': '地风升', '坤坎': '地水师', '坤艮': '地山谦', '坤坤': '坤为地'
}

/**
 * 时间起卦
 * @param {number} year 年
 * @param {number} month 月
 * @param {number} day 日
 * @param {number} hour 时（0-23）
 */
function timeGua(year, month, day, hour) {
  // 上卦 = (年+月+日) % 8
  const upperNum = (year + month + day) % 8 || 8
  // 下卦 = (年+月+日+时) % 8
  const lowerNum = (year + month + day + hour) % 8 || 8
  // 动爻 = (年+月+日+时) % 6
  const dongYao = (year + month + day + hour) % 6 || 6

  const upperGua = SHU_TO_GUA[upperNum]
  const lowerGua = SHU_TO_GUA[lowerNum]

  return {
    upperGua,
    lowerGua,
    upperNum,
    lowerNum,
    dongYao,
    guaName: LIUSHISI_GUA[upperGua + lowerGua] || upperGua + lowerGua,
    ...buildGuaDisplay(upperGua, lowerGua, dongYao)
  }
}

/**
 * 数字起卦
 * @param {number} num1 第一个数
 * @param {number} num2 第二个数（可选）
 */
function numberGua(num1, num2) {
  let upperNum, lowerNum, dongYao

  if (num2 !== undefined) {
    upperNum = num1 % 8 || 8
    lowerNum = num2 % 8 || 8
    dongYao = (num1 + num2) % 6 || 6
  } else {
    // 单数字，拆分位数
    const str = String(num1)
    if (str.length >= 2) {
      const upperPart = parseInt(str.slice(0, Math.ceil(str.length / 2)))
      const lowerPart = parseInt(str.slice(Math.ceil(str.length / 2)))
      upperNum = upperPart % 8 || 8
      lowerNum = lowerPart % 8 || 8
      dongYao = num1 % 6 || 6
    } else {
      upperNum = num1 % 8 || 8
      lowerNum = num1 % 8 || 8
      dongYao = num1 % 6 || 6
    }
  }

  const upperGua = SHU_TO_GUA[upperNum]
  const lowerGua = SHU_TO_GUA[lowerNum]

  return {
    upperGua,
    lowerGua,
    upperNum,
    lowerNum,
    dongYao,
    guaName: LIUSHISI_GUA[upperGua + lowerGua] || upperGua + lowerGua,
    ...buildGuaDisplay(upperGua, lowerGua, dongYao)
  }
}

/**
 * 构建卦象显示数据
 */
function buildGuaDisplay(upperGua, lowerGua, dongYao) {
  // 八卦的二进制表示（阳爻=1，阴爻=0，从下到上）
  const guaBinary = {
    '乾': [1, 1, 1], '兑': [1, 1, 0], '离': [1, 0, 1], '震': [1, 0, 0],
    '巽': [0, 1, 1], '坎': [0, 1, 0], '艮': [0, 0, 1], '坤': [0, 0, 0]
  }

  const upperYao = guaBinary[upperGua] || [0, 0, 0]
  const lowerYao = guaBinary[lowerGua] || [0, 0, 0]

  // 完整卦象（从下到上）
  const allYao = [...lowerYao, ...upperYao]

  // 构建爻位信息
  const yaoInfo = []
  const yaoNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

  for (let i = 0; i < 6; i++) {
    const isYang = allYao[i] === 1
    const isDong = (i + 1) === dongYao

    yaoInfo.push({
      name: yaoNames[i],
      isYang,
      isDong,
      display: isYang ? '━━━━' : '━  ━'
    })
  }

  // 变卦
  const bianYao = allYao.map((y, i) => (i + 1) === dongYao ? (1 - y) : y)
  const bianLowerYao = bianYao.slice(0, 3)
  const bianUpperYao = bianYao.slice(3)

  const bianUpperGua = findGuaByBinary(bianUpperYao)
  const bianLowerGua = findGuaByBinary(bianLowerYao)

  return {
    yaoInfo,
    originalGua: {
      upper: upperGua,
      lower: lowerGua,
      name: LIUSHISI_GUA[upperGua + lowerGua] || upperGua + lowerGua
    },
    changedGua: {
      upper: bianUpperGua,
      lower: bianLowerGua,
      name: LIUSHISI_GUA[bianUpperGua + bianLowerGua] || bianUpperGua + bianLowerGua
    }
  }
}

/**
 * 根据二进制找卦名
 */
function findGuaByBinary(binary) {
  const guaBinary = {
    '乾': [1, 1, 1], '兑': [1, 1, 0], '离': [1, 0, 1], '震': [1, 0, 0],
    '巽': [0, 1, 1], '坎': [0, 1, 0], '艮': [0, 0, 1], '坤': [0, 0, 0]
  }

  for (const [name, yao] of Object.entries(guaBinary)) {
    if (yao.join('') === binary.join('')) {
      return name
    }
  }
  return '坤'
}

/**
 * 获取卦象信息
 */
function getGuaInfo(guaName) {
  const [upper, lower] = guaName.split('')
  const upperInfo = BAGUA.find(b => b.name === upper)
  const lowerInfo = BAGUA.find(b => b.name === lower)

  return {
    upper: upperInfo,
    lower: lowerInfo,
    fullName: LIUSHISI_GUA[guaName] || guaName
  }
}

module.exports = {
  BAGUA,
  XIAN_TIAN_SHU,
  SHU_TO_GUA,
  LIUSHISI_GUA,
  timeGua,
  numberGua,
  buildGuaDisplay,
  getGuaInfo
}
