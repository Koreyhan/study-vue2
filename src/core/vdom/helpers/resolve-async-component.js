/* @flow */

import {
  warn,
  once,
  isDef,
  isUndef,
  isTrue,
  isObject,
  hasSymbol,
  isPromise
} from 'core/util/index'

import { createEmptyVNode } from 'core/vdom/vnode'

function ensureCtor (comp: any, base) {
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    comp = comp.default
  }
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

export function createAsyncPlaceholder (
  factory: Function,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag: ?string
): VNode {
  const node = createEmptyVNode()
  node.asyncFactory = factory
  node.asyncMeta = { data, context, children, tag }
  return node
}

export function resolveAsyncComponent (
  factory: Function,
  baseCtor: Class<Component>,
  context: Component
): Class<Component> | void {
  // 高级异步组件，渲染 error 的时机
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  // 加载完成之后，第二次渲染就会有组件构造函数了
  if (isDef(factory.resolved)) {
    return factory.resolved
  }

  // 高级异步组件，渲染loading的时机
  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (isDef(factory.contexts)) {
    // already pending
    // 防止多个异步组件同时使用时不重复加载，同时缓存多个上下文
    factory.contexts.push(context)
  } else {
    const contexts = factory.contexts = [context]
    let sync = true

    // 组件加载完成，触发上下文更新渲染 
    const forceRender = (renderCompleted: boolean) => {
      for (let i = 0, l = contexts.length; i < l; i++) {
        contexts[i].$forceUpdate()
      }

      if (renderCompleted) {
        contexts.length = 0
      }
    }

    // 工厂函数 - resolve
    const resolve = once((res: Object | Class<Component>) => {
      // cache resolved
      // 保证找到正确的组件对象，并且通过 extent 改造成构造函数
      factory.resolved = ensureCtor(res, baseCtor)
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        forceRender(true)
      }
    })

    // 工厂函数 - reject
    const reject = once(reason => {
      process.env.NODE_ENV !== 'production' && warn(
        `Failed to resolve async component: ${String(factory)}` +
        (reason ? `\nReason: ${reason}` : '')
      )
      if (isDef(factory.errorComp)) {
        factory.error = true
        forceRender(true)
      }
    })

    // 工厂函数/Promise/高级异步组件  - 真正执行异步函数
    const res = factory(resolve, reject)

    if (isObject(res)) {
      if (isPromise(res)) {
        // Promise 异步组件
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject) // Promise 形式，这里接着后续操作
        }
      } else if (isPromise(res.component)) {
        // 高级异步组件，支持 component、loading、error、、delay、timeout 配置
        res.component.then(resolve, reject) // 高级异步组件，这里接着后续操作

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor)
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor)
          if (res.delay === 0) {
            factory.loading = true
          } else {
            setTimeout(() => {
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true
                forceRender(false)
              }
            }, res.delay || 200)
          }
        }

        if (isDef(res.timeout)) {
          setTimeout(() => {
            if (isUndef(factory.resolved)) {
              reject(
                process.env.NODE_ENV !== 'production'
                  ? `timeout (${res.timeout}ms)`
                  : null
              )
            }
          }, res.timeout)
        }
      }
    }

    sync = false
    // return in case resolved synchronously
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}
