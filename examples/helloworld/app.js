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
      obj: {
        name: '丽丽'
      }
    }
  },

  mounted () {
    console.log(this)
  },

  methods: {
    removeTodo: function (todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    },
    changeText () {
      this.obj.name = '乖乖'
    },
    addCity () {
      this.$set(this.obj, 'city', '北京')
    }
  },
  
  render (h) {
    return h('section', { id: 'hah' }, [
      JSON.stringify(this.obj),
      '------',
      `name: ${this.obj.name}`,
      h('button', { on: { click: this.changeText } }, '修改文案'),
      h('button', { on: { click: this.addCity } }, '添加城市')
    ])
  }
})

// mount
app.$mount('#app')
