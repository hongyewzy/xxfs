Component({
  properties: {
    content: {
      type: String,
      value: '',
      observer: 'parseContent'
    }
  },

  data: {
    parsedHtml: ''
  },

  methods: {
    parseContent() {
      const markdown = require('../../utils/markdown.js')
      const html = markdown.parseMarkdown(this.data.content)
      this.setData({ parsedHtml: html })
    }
  }
})
