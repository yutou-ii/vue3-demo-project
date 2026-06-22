<script setup>
defineProps({
  taskName: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['taskCompleted'])

function completeTask() {
  // 子组件通过自定义事件把本次学习分钟数回传给父组件
  emit('taskCompleted', 30)
}
</script>

<template>
  <article class="task-card">
    <div>
      <p class="task-label">当前任务</p>
      <h3>{{ taskName }}</h3>
      <p>预计学时：30 分钟</p>
    </div>

    <button class="check-button" type="button" @click="completeTask">
      完成打卡
    </button>
  </article>
</template>
