/* global Vue */

var myComp = Vue.component('my-comp', {
  render (h) {
    return h('p', {
      style: {
        backgroundColor: 'red'
      }
    }, 'app组件')
  }
})

var app = new Vue({
  data: {
    name: '丽丽'
  },

  mounted () {
    console.log(this)
  },

  methods: {
    removeTodo: function (todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    }
  },
  
  render (h) {
    return h('section', { id: 'hah' }, ['根组件', h(myComp)])
  }
})

// mount
app.$mount('#app')
