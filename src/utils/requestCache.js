/**
 * 请求缓存与去重层
 *
 * 三层拦截策略：
 *   第一层 —— 请求去重（Dedup）：
 *     相同参数的并发 GET 请求自动合并，共享同一个 Promise，
 *     解决"快速点击搜索按钮 3 次发出 3 个相同请求"的问题。
 *   第二层 —— 响应缓存（Cache）：
 *     GET 请求结果按 TTL 存入 Map，有效期内命中直接返回，
 *     解决"翻到第 2 页翻回第 1 页又发请求"的问题。
 *   第三层 —— 透传（Passthrough）：
 *     非 GET 请求 / 显式标记 _noCache 的请求直接走原始适配器。
 *
 * @module requestCache
 */

// 请求缓存管理器

/** 默认缓存有效期：30 秒 */
const DEFAULT_TTL = 30_000

class RequestCacheManager {
  constructor() {
    /**
     * 飞行中的请求 Map
     * key → Promise<AxiosResponse>
     * 用于合并相同请求，避免重复发出
     * @type {Map<string, Promise>}
     */
    this.pendingMap = new Map()

    /**
     * 响应缓存 Map
     * key → { response, timestamp, ttl }
     * @type {Map<string, {response: object, timestamp: number, ttl: number}>}
     */
    this.cacheMap = new Map()

    /** 统计信息（DEV 模式下可通过 window.__requestCache.stats 查看） */
    this.stats = { hits: 0, misses: 0, deduped: 0 }
  }

  // 公开 API

  /**
   * 生成请求唯一标识
   * 基于 HTTP 方法 + URL + 查询参数 + 请求体的确定性序列化
   *
   * 为什么用 JSON.stringify 而不是对象引用？
   *   不同调用方可能构造不同的 params 对象但内容相同，
   *   JSON 序列化保证"内容相同 → key 相同"。
   *
   * @param {object} config - Axios 请求配置
   * @returns {string} 形如 "GET::/my/article/list::{"pagenum":1}::{}"
   */
  generateKey(config) {
    const { method = 'get', url = '', params, data } = config
    return [
      method.toUpperCase(),
      url,
      JSON.stringify(params || {}),
      JSON.stringify(data || {})
    ].join('::')
  }

  /**
   * 判断请求是否应走缓存逻辑
   * 仅 GET 且未标记 _noCache 的请求进入缓存管线
   *
   * 为什么排除非 GET？
   *   REST 语义：GET 是幂等的、安全的；POST/PUT/DELETE 有副作用。
   *   缓存有副作用的请求会导致：删除后再查询返回旧数据（脏读）。
   *
   * @param {object} config
   * @returns {boolean}
   */
  isCacheable(config) {
    if (!config || !config.method) return false
    return config.method.toLowerCase() === 'get' && !config._noCache
  }

  /**
   * 读取缓存
   * 自动检查 TTL 过期，过期条目即时清除
   *
   * @param {string} key
   * @returns {object|null} axios response 对象或 null
   */
  getCached(key) {
    const entry = this.cacheMap.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cacheMap.delete(key)
      return null
    }

    this.stats.hits++
    return entry.response
  }

  /**
   * 写入缓存
   * 对 response 做浅克隆（展开 + data 深拷贝），防止外部代码修改污染缓存
   *
   * 为什么 data 要 JSON.parse(JSON.stringify())？
   *   JavaScript 对象是引用传递。如果调用方拿到 response 后
   *   修改了 response.data.xxx，下次缓存命中时拿到的就是被污染的数据。
   *   JSON 往返虽然粗暴，但对 API 响应数据（纯 JSON）零副作用。
   *
   * @param {string} key
   * @param {object} response - Axios 响应对象
   * @param {number} [ttl] - 过期时间（毫秒）
   */
  setCache(key, response, ttl = DEFAULT_TTL) {
    this.cacheMap.set(key, {
      response: {
        ...response,
        data: JSON.parse(JSON.stringify(response.data))
      },
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * 按模式清除缓存
   *
   * 使用场景：
   *   删除文章后 → invalidate('/my/article') 清除所有文章列表缓存
   *   添加分类后 → invalidate('/my/cate/list') 清除分类列表缓存
   *
   * 匹配逻辑：cache key 包含 pattern 字符串即命中
   *
   * @param {string} pattern - URL 片段
   * @returns {number} 清除的条目数
   */
  invalidate(pattern) {
    let count = 0
    for (const key of this.cacheMap.keys()) {
      if (key.includes(pattern)) {
        this.cacheMap.delete(key)
        count++
      }
    }
    if (count > 0 && import.meta.env.DEV) {
      console.log(
        `%c[RequestCache]%c 已清除 ${count} 条缓存 %c(${pattern})`,
        'color: #4fc08d; font-weight: bold',
        '',
        'color: #999'
      )
    }
    return count
  }

  /** 清空所有缓存和飞行中的请求 */
  clear() {
    this.cacheMap.clear()
    this.pendingMap.clear()
    this.stats = { hits: 0, misses: 0, deduped: 0 }
  }

  /** 获取缓存统计信息 */
  getStats() {
    const total = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      total,
      hitRate: total > 0 ? `${((this.stats.hits / total) * 100).toFixed(1)}%` : '0.0%',
      cacheSize: this.cacheMap.size,
      pendingSize: this.pendingMap.size
    }
  }
}

// 单例导出 —— 整个应用只有一个缓存空间
export const cacheManager = new RequestCacheManager()

// Axios 适配器包装器

/**
 * 创建带缓存能力的 Axios 适配器
 * 原理：
 *   Axios 的 adapter 是请求的最终出口——它接收 config，返回 Promise<response>。
 *   我们在原始 adapter 外面包一层：
 *     1. 检查是否可以走缓存
 *     2. 检查是否有相同的请求正在飞行（去重）
 *     3. 检查缓存是否命中
 *     4. 都不满足 → 放行到原始 adapter → 缓存结果
 * 
 * @param {Function} originalAdapter - Axios 原始适配器（xhr / http）
 * @returns {Function} 包装后的适配器，签名与 AxiosAdapter 一致
 */
export function createCacheAdapter(originalAdapter) {
  return (config) => {
    // 非缓存类请求：透传给原始适配器
    if (!cacheManager.isCacheable(config)) {
      return originalAdapter(config)
    }

    const key = cacheManager.generateKey(config)

    // 第一层：请求去重
    // 如果完全相同的请求正在飞行中，直接返回那个 Promise
    // 多个调用方共享同一个网络请求的结果
    if (cacheManager.pendingMap.has(key)) {
      cacheManager.stats.deduped++
      if (import.meta.env.DEV) {
        console.log(
          `%c[RequestCache]%c 去重命中，共享飞行中的请求 %c(${key})`,
          'color: #4fc08d; font-weight: bold',
          '',
          'color: #999'
        )
      }
      // 返回共享的 Promise，避免重复请求
      return cacheManager.pendingMap.get(key)
    }

    // 第二层：响应缓存
    // 有效期内直接返回缓存副本，不发起网络请求
    const cached = cacheManager.getCached(key)
    if (cached) {
      if (import.meta.env.DEV) {
        console.log(
          `%c[RequestCache]%c 缓存命中 %c(${key})`,
          'color: #4fc08d; font-weight: bold',
          '',
          'color: #999'
        )
      }
      return Promise.resolve(cached)
    }
    cacheManager.stats.misses++

    // 第三层：发起真实请求并缓存结果
    const promise = originalAdapter(config)
      .then(response => {
        cacheManager.pendingMap.delete(key)
        // 只缓存成功的响应
        cacheManager.setCache(key, response, config._cacheTTL || DEFAULT_TTL)
        return response
      })
      .catch(error => {
        // 请求失败：清除 pending 标记，不缓存错误
        cacheManager.pendingMap.delete(key)
        throw error
      })

    // 立即注册到 pendingMap，阻止后续相同请求重复发出
    cacheManager.pendingMap.set(key, promise)
    return promise
  }
}

// 开发调试

if (import.meta.env.DEV) {
  // 挂载到 window，方便在浏览器控制台调试：
  //   __requestCache.getStats()   → 查看缓存命中率
  //   __requestCache.clear()     → 清空所有缓存
  //   __requestCache.invalidate('/my/article') → 清除特定缓存
  window.__requestCache = cacheManager
}
