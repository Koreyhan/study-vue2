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

Vue.component('my-comp1', function (resolve) {
  setTimeout(function () {
    resolve({
      render (h)  {
        return h('p', '1212')
      }
    })
  }, 1000)
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
    return h('section', { id: 'hah' }, ['根组件', h(myComp), h('my-comp1')])
  }
})

// mount
app.$mount('#app')
