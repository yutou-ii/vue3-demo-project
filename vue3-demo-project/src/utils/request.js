import axios from 'axios'

// 创建 axios 实例，统一管理 baseURL 和超时时间
// 所有页面都从该文件导入 request，避免在每个组件中重复配置
const service = axios.create({
  // 所有请求以 /api 开头，开发阶段由 Vite 代理转发到目标服务器
  baseURL: '/api',
  // 请求超过 5 秒没有收到响应就自动中断（避免页面一直卡在"加载中"）
  timeout: 5000,
})

// -------------------- 请求拦截器 --------------------
// 在请求发出之前执行，适合统一添加 Token、修改请求头等操作
service.interceptors.request.use(
  (config) => {
    console.info('请求拦截器触发：准备发送请求')

    // 实际项目中可从 localStorage 或 Pinia store 中读取 Token
    // 本练习使用假 Token 演示“统一给所有请求加认证信息”的流程
    const myToken = 'fakeToken123456'
    config.headers.Authorization = `Bearer ${myToken}`

    // 必须返回 config，否则 axios 不知道该如何继续发送本次请求
    return config
  },
  (error) => {
    // 请求配置出错（极少发生），直接拒绝 Promise
    return Promise.reject(error)
  },
)

// -------------------- 响应拦截器 --------------------
// 在服务器返回数据之后、页面拿到数据之前执行
// 作用：统一处理响应数据的拆包（.data）和异常情况的日志记录
service.interceptors.response.use(
  // ----- 正常响应（状态码 2xx）-----
  (response) => {
    console.info('响应拦截器触发：准备处理响应数据')

    // response.data 才是后端返回的业务数据主体
    const res = response.data

    // 天行数据接口中 code === 200 表示业务成功
    // 若其他接口没有 code 字段，也直接返回数据，避免误伤普通接口
    if (res.code === undefined || res.code === 200) {
      return res
    }

    // HTTP 请求成功，但业务状态失败，例如 key 错误、参数错误等
    console.error(`业务执行失败：${res.msg}`)
    return Promise.reject(new Error(res.msg || '业务请求失败'))
  },

  // ----- 异常响应（状态码非 2xx、网络错误、超时等）-----
  (error) => {
    // 情况一：服务器有返回响应，但 HTTP 状态码不是 2xx
    if (error.response) {
      const status = error.response.status

      if (status === 404) {
        // 接口地址写错了，或后端尚未部署该接口
        console.error('请求的接口地址不存在')
      } else if (status === 500) {
        // 后端代码抛出了未捕获的异常
        console.error('服务器内部崩溃故障')
      } else {
        // 403（无权限）、502（网关错误）等其他非 2xx 状态码
        console.error(`HTTP 请求异常，状态码：${status}`)
      }
    }
    // 情况二：请求超时（超过 axios.create 中配置的 timeout 值后被自动中断）
    // ECONNABORTED 是 axios 在超时时主动抛出的错误码
    else if (error.code === 'ECONNABORTED') {
      console.error('网络请求连接超时')
    }
    // 情况三：网络断开、DNS 解析失败、请求被浏览器拦截等其他异常
    else {
      console.error('网络连接失败或请求被浏览器拦截')
    }

    // 将错误继续往外抛，让页面里的 .catch() 也能捕获到错误信息
    // 这样组件层可以做出相应的 UI 反馈（如提示用户重试）
    return Promise.reject(error)
  },
)

export default service
