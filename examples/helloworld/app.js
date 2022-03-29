/* global Vue */

var myComp = Vue.component('my-comp', {
  mounted () {
    console.log('my-comp', this)
  },
  render (h) {
    return h('p', {
      style: {
        backgroundColor: 'red'
      }
    }, 'app组件')
  }
})

console.log(myComp)

var app = new Vue({
  data () {
    return {
      name: '丽丽'
    }
  },

  mounted () {
    console.log(this)
  },

  methods: {
    removeTodo: function (todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    },
    click () {
      this.name = '乖乖'
    }
  },
  
  render (h) {
    return h('section', { id: 'hah' }, [
      this.name,
      h('button', { on: { click: this.click } }, '按钮')
    ])
  }
})

// mount
app.$mount('#app')
