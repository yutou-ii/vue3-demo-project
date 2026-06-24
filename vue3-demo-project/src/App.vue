<script setup>
import { ref } from 'vue'
import TaskItem from './components/TaskItem.vue'
import RequestTest from './components/RequestTest.vue'

// 练习 1：控制技能墙是否显示
const showWall = ref(true)

// 练习 1：技能数组用于 v-for 循环渲染
const mySkills = ref(['Vue3', 'SpringBoot', 'Git'])

// 练习 2：父组件保存累计学习时长
const totalTime = ref(0)

function toggleWall() {
  showWall.value = !showWall.value
}

function handleTaskCompleted(minutes) {
  totalTime.value += minutes
}
</script>

<template>
  <main class="page-shell">
    <section class="panel">
      <div class="section-title">
        <span>练习 1</span>
        <h1>伴学技能标签管理器</h1>
      </div>

      <button class="primary-button" type="button" @click="toggleWall">
        {{ showWall ? '隐藏技能墙' : '显示技能墙' }}
      </button>

      <ul v-if="showWall" class="skill-wall">
        <li v-for="(skill, index) in mySkills" :key="skill" class="skill-tag">
          <span>{{ index + 1 }}</span>
          {{ skill }}
        </li>
      </ul>

      <p v-else class="empty-text">技能墙已被隐藏</p>
    </section>

    <section class="panel">
      <div class="section-title">
        <span>练习 2</span>
        <h2>打卡学时互传系统</h2>
      </div>

      <p class="total-time">
        当前累计学时：
        <strong>{{ totalTime }}</strong>
        分钟
      </p>

      <TaskItem
        task-name="Vue 3 组件通信训练"
        @task-completed="handleTaskCompleted"
      />
    </section>

    <!-- ========== 0618 下午课后练习：Axios 拦截器与 Vite 代理测试 ========== -->
    <section class="panel">
      <div class="section-title">
        <span>0618 下午课后练习</span>
        <h2>Axios 错误处理拦截器与 Vite 多代理规则</h2>
      </div>
      <RequestTest />
    </section>
  </main>
</template>
