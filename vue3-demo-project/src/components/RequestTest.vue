<script setup>
import { ref } from 'vue'
import request from '../utils/request.js'
import axios from 'axios'

// 页面测试结果显示文字
const testResult = ref('请点击下方按钮完成课后练习验证')
// 当前测试请求路径，便于写报告时截图说明
const currentUrl = ref('')
const reportTip = ref('建议同时打开浏览器 F12：Console 面板看错误日志，Network 面板看请求路径。')

// 用于测试 Vite 多代理规则的专用 axios 实例（不含 baseURL）
// 因为 request 实例的 baseURL 固定为 /api，无法发送 /api-user/xxx 这样的请求路径
// 这个 proxyTester 实例没有 baseURL，请求路径原样发送给 Vite 代理去匹配
const proxyTester = axios.create({ timeout: 5000 })

// ----- 测试 1：故意写错路径，触发 404 错误 -----
function test404() {
  currentUrl.value = 'GET /api/nonexistent-path-12345'
  testResult.value = '正在触发 404 测试，请查看 Console 面板...'
  reportTip.value =
    '报告截图重点：页面提示请求失败，Console 面板出现“请求的接口地址不存在”。'

  request
    .get('/nonexistent-path-12345')
    .then((res) => {
      testResult.value = '请求成功（意外）：' + JSON.stringify(res)
    })
    .catch((err) => {
      // 错误的详细日志已在响应拦截器中通过 console.error 输出
      // 此处仅更新页面 UI 提示用户去控制台查看
      testResult.value =
        '请求失败，控制台应显示："请求的接口地址不存在"'
    })
}

// ----- 测试 2：验证 /api-user 代理规则是否被正确匹配 -----
function testProxyUser() {
  currentUrl.value = 'GET /api-user/profile → http://user.server.com/profile'
  testResult.value =
    '正在测试 /api-user 代理规则，请查看 Network 面板...'
  reportTip.value =
    '报告截图重点：Network 面板中出现 /api-user/profile 请求；配置代码中展示 target 和 rewrite。'

  proxyTester
    .get('/api-user/profile')
    .catch(() => {
      // 目标服务器 http://user.server.com 并不存在，所以请求一定会失败
      // 这是预期的行为 —— 我们只需要确认 Vite 代理匹配到了正确的 target 即可
      // 在 Network 面板中可以看到请求地址从 /api-user/profile 被转发到了 http://user.server.com/profile
      testResult.value =
        '/api-user 代理规则已触发（目标服务器不可达是预期行为，注意 Network 面板中的请求地址）'
    })
}

// ----- 测试 3：验证 /api-skill 代理规则是否被正确匹配 -----
function testProxySkill() {
  currentUrl.value = 'GET /api-skill/list → http://skill.server.com/list'
  testResult.value =
    '正在测试 /api-skill 代理规则，请查看 Network 面板...'
  reportTip.value =
    '报告截图重点：Network 面板中出现 /api-skill/list 请求；配置代码中展示第二条代理规则。'

  proxyTester
    .get('/api-skill/list')
    .catch(() => {
      testResult.value =
        '/api-skill 代理规则已触发（目标服务器不可达是预期行为，注意 Network 面板中的请求地址）'
    })
}
</script>

<template>
  <div class="test-section">
    <p class="exercise-text">
      练习 1：点击 404 测试按钮，验证响应拦截器是否能分类捕获错误。
      练习 2：点击两个代理测试按钮，验证 Vite 是否配置了多条代理规则。
    </p>

    <div class="button-group">
      <button class="primary-button" type="button" @click="test404">
        测试 404 错误处理
      </button>
      <button class="primary-button" type="button" @click="testProxyUser">
        测试 /api-user 代理
      </button>
      <button class="primary-button" type="button" @click="testProxySkill">
        测试 /api-skill 代理
      </button>
    </div>

    <div class="test-info">
      <p v-if="currentUrl" class="url-display">
        当前请求：<code>{{ currentUrl }}</code>
      </p>
      <p class="result-display">{{ testResult }}</p>
      <p class="report-tip">{{ reportTip }}</p>
    </div>
  </div>
</template>

<style scoped>
.test-section {
  margin-top: 8px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.test-info {
  margin-top: 16px;
}

.exercise-text {
  margin-bottom: 14px;
  color: var(--muted);
  line-height: 1.7;
}

.url-display {
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 14px;
}

.url-display code {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f0f0f0;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  word-break: break-all;
}

.result-display {
  color: var(--muted);
  line-height: 1.6;
}

.report-tip {
  margin-top: 8px;
  color: var(--primary);
  line-height: 1.6;
}
</style>
