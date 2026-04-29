Component({
  data: {
    stars: [],
    showShooting: [false, false]
  },

  lifetimes: {
    attached() {
      this.initStars()
      this.startShootingStar()
    }
  },

  methods: {
    initStars() {
      const stars = []

      // 大星星 - 金色 - 6个
      for (let i = 0; i < 6; i++) {
        stars.push({
          id: 'large-' + i,
          left: Math.random() * 100 + '%',
          top: Math.random() * 50 + '%',
          size: 'large',
          animationDelay: Math.random() * 3 + 's',
          duration: Math.random() * 2000 + 2500
        })
      }

      // 中星星 - 深灰 - 15个
      for (let i = 0; i < 15; i++) {
        stars.push({
          id: 'medium-' + i,
          left: Math.random() * 100 + '%',
          top: Math.random() * 80 + '%',
          size: 'medium',
          animationDelay: Math.random() * 4 + 's',
          duration: Math.random() * 2000 + 2000
        })
      }

      // 小星星 - 浅灰 - 25个
      for (let i = 0; i < 25; i++) {
        stars.push({
          id: 'small-' + i,
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          size: 'small',
          animationDelay: Math.random() * 5 + 's',
          duration: Math.random() * 2000 + 1500
        })
      }

      this.setData({ stars })
    },

    startShootingStar() {
      const triggerShooting = (index) => {
        if (index >= 2) index = 0

        const showShooting = [false, false]
        showShooting[index] = true
        this.setData({ showShooting })

        setTimeout(() => {
          this.setData({
            [`showShooting[${index}]`]: false
          })
          setTimeout(() => {
            triggerShooting((index + 1) % 2)
          }, Math.random() * 8000 + 6000)
        }, 4000)
      }

      setTimeout(() => triggerShooting(0), 5000)
    }
  }
})
