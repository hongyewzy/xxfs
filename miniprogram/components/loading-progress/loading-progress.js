// components/loading-progress/loading-progress.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    text: {
      type: String,
      value: '正在分析中...'
    },
    icon: {
      type: String,
      value: '🔮'
    },
    duration: {
      type: Number,
      value: 30000 // 30秒内进度到90%
    }
  },

  data: {
    percent: 0,
    showHint: false
  },

  observers: {
    'show': function(show) {
      if (show) {
        this.startProgress()
      } else {
        this.stopProgress()
      }
    }
  },

  methods: {
    startProgress() {
      this.stopProgress()
      this.setData({ percent: 0, showHint: false })

      const duration = this.properties.duration
      const interval = 100
      const steps = duration / interval
      const increment = 90 / steps

      this.timer = setInterval(() => {
        let percent = this.data.percent + increment
        if (percent >= 90) {
          percent = 90
          this.stopProgress()
        }
        this.setData({ percent })

        // 超过10秒显示提示
        if (this.data.percent > 30 && !this.data.showHint) {
          this.setData({ showHint: true })
        }
      }, interval)
    },

    stopProgress() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    complete() {
      this.setData({ percent: 100, showHint: false })
      setTimeout(() => {
        this.stopProgress()
      }, 300)
    }
  },

  detached() {
    this.stopProgress()
  }
})