import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // -------------------- 开发服务器代理配置 --------------------
  // 作用：解决开发阶段前后端分离时的跨域问题
  // 原理：浏览器请求同源的 /api 地址，Vite 开发服务器代为转发到目标服务器
  // 注意：修改此文件后必须重新启动 npm run dev 才能生效
  server: {
    proxy: {
      // ---- 规则 1：用户微服务接口 ----
      // 匹配所有以 /api-user 开头的请求路径
      // ⚠️ 必须放在 /api 规则前面！因为 /api 也能匹配到 /api-user
      // Vite 按对象键的排列顺序依次匹配，第一个匹配到的规则生效
      '/api-user': {
        // 转发目标：用户微服务的测试服务器
        target: 'http://user.server.com',
        // 修改请求头中的 Origin 属性，让目标服务器正常处理请求
        changeOrigin: true,
        // 转发前移除 /api-user 前缀，后端接收到的就是干净的接口路径
        // 例如：/api-user/profile → http://user.server.com/profile
        rewrite: (path) => path.replace(/^\/api-user/, ''),
      },

      // ---- 规则 2：技能微服务接口 ----
      // 匹配所有以 /api-skill 开头的请求路径
      // ⚠️ 同样必须放在 /api 规则前面，避免被 /api 规则错误捕获
      '/api-skill': {
        // 转发目标：技能微服务的测试服务器
        target: 'http://skill.server.com',
        changeOrigin: true,
        // 例如：/api-skill/list → http://skill.server.com/list
        rewrite: (path) => path.replace(/^\/api-skill/, ''),
      },

      // ---- 规则 3：通用 API 接口（兜底规则）----
      // 匹配所有以 /api 开头的请求
      // 因为 /api-user 和 /api-skill 已经先匹配了更具体的路径
      // 所以这条规则实际只会处理 /api/xxx 形式的请求
      '/api': {
        // 转发目标：综合 API 服务器
        target: 'https://apis.tianapi.com',
        changeOrigin: true,
        // 例如：/api/dgryl/index → https://apis.tianapi.com/dgryl/index
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
