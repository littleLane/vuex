/**
 * Vuex 装载逻辑
 * @param {*} Vue 
 */
export default function (Vue) {
  const version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    // Vue 2.x 使用 Vue.mixin 向 Vue 实例混入 beforeCreate 生命钩子函数
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    // Vue 1.x 代理 Vue.prototype._init
    // Vue 1.x 有个叫 init 的生命周期方法，目的是改写 init 生命周期函数
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   * Vuex 初始化逻辑
   */
  function vuexInit () {
    // 不管是 Vue 2.x 通过 Vue.mixin 混入 beforeCreate
    // 还是 Vue 1.x 改写 init 生命周期函数
    // 最终 vuexInit 调用上下文都是 Vue 实例，所以这里 this 指 Vue 实例
    const options = this.$options

    // store injection
    // 获取 new Vue({}) 时，通过 options 传入的定义好的 store
    // 然后将 options.store 挂载 Vue 实例的 $store 上
    // 后面我们使用的时候，就可以  this.$store.state
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      // 如果组件自身没有，就去父组件找 $store
      this.$store = options.parent.$store
    }
  }
}
