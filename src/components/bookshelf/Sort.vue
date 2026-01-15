<template>
  <div class="sort">
    <div class="sort-item">
      <!-- 引入element-plus的el-radio-group组件 -->
      <el-radio-group :model-value="currentSortType"  @change="handleSortChange">
        <!-- 将 label 拆分为 value 和 label -->
        <el-radio v-for="item in sortOptions" :key="item.value" :value="item.value" :label="item.label" />
      </el-radio-group>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { defineEmits,defineProps } from 'vue'

const props = defineProps({
  currentSortType: {
    type: String,
    required: true
  },
    sortOptions: {
    type: Array,
    required: true
  }
})

// 定义事件：sortChange
const emit = defineEmits(['sortChange'])

const handleSortChange = (newSortType) => {
  console.log('子组件发送排序变化:', newSortType)
  emit('sortChange', newSortType)
}


</script>

<style scoped>
.sort {
  padding: 24px 24px 16px;
  background: #fefefe;
  border-bottom: 1px solid #f0f0f0;
}

.sort-item {
  max-width: 1200px;
  margin: 0 auto;
}

.sort-item :deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* 更紧凑的间距 */
}

.sort-item :deep(.el-radio) {
  margin: 0 !important;
}

.sort-item :deep(.el-radio__input) {
  display: none;
}

.sort-item :deep(.el-radio__label) {
  /* 方形基础：内边距、边框、背景 */
  padding: 10px 22px;
  background: transparent;
  border: 1.5px solid #d9d9d9; /* 文艺感的中性灰边框 */
  border-radius: 6px; /* 小圆角，趋近方形 */
  color: #666;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  /* 去掉阴影，保持扁平 */
  box-shadow: none;
}

/* 悬停状态：加深边框，背景略变 */
.sort-item :deep(.el-radio__label:hover) {
  border-color: #a3a3a3;
  background-color: #fafafa;
  color: #333;
}

/* 选中状态：文艺感配色（例如墨绿/深蓝），去掉渐变 */
.sort-item :deep(.el-radio.is-checked .el-radio__label) {
  background-color: #f0f6ff; /* 非常浅的背景 */
  border-color: #4f88ff; /* 主色边框 */
  color: #4f88ff; /* 主色文字 */
  font-weight: 600;
}
</style>