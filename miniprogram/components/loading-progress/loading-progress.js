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
      value: 8000
    }
  },

  data: {
    percent: 0
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
      this.setData({ percent: 0 })

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
      }, interval)
    },

    stopProgress() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    complete() {
      this.setData({ percent: 100 })
      setTimeout(() => {
        this.stopProgress()
      }, 300)
    }
  },

  detached() {
    this.stopProgress()
  }
})