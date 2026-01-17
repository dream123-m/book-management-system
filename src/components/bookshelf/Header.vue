<template>
  <div class="header">
    <!-- 左侧区域：标题 -->
    <div class="header-left">
      <h1 class="logo">我的书库</h1>
    </div>
    
    <!-- 中间区域：搜索框 -->
 <div class="header-center">
      <div class="search-wrapper">
             <el-input 
          v-model="searchValue" placeholder="请输入书名、作者、状态等关键词，按回车搜索" :prefix-icon="Search" clearable class="search-input"
          @keyup.enter="handleSearch"
          @clear="handleClear"
        />
      </div>
    </div>
    
    <!-- 右侧区域：操作按钮 -->
    <div class="header-right">
      <el-button type="primary" class="add-btn" @click="goAddBooks" >
        添加书籍
      </el-button>
    </div>
  </div>
</template>

<script setup>
// 导入图标组件
import {ref} from 'vue'
import { Search} from '@element-plus/icons-vue';
import router from '@/router'; // 导入路由实例

// 搜索框输入值
const searchValue = ref('');
// 向父组件传递搜索关键词
const emit = defineEmits(['search']);

// 处理搜索
const handleSearch = () => {
emit('search',searchValue.value)
};

// 处理搜索框清空
const handleClear = () => {
  searchValue.value = '';
  emit('search','')
};



// 跳转添加书籍页面
const goAddBooks = () => {
  router.push('/addbooks');
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 32px;
  background: #faf8f3;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  z-index: 100;
}

/* 左侧Logo - 极简风格 */
.header-left {
  flex: 0 0 auto;
}

.logo {
  font-size: 1.1rem;
  font-weight: 400;
  color: #333;
  margin: 0;
  letter-spacing: 3px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo::before {
  content: "";
  width: 3px;
  height: 18px;
  background: linear-gradient(to bottom, #8b7355, #c9a96e);
  border-radius: 2px;
}

/* 中间搜索区 */
.header-center {
  flex: 1;
  max-width: 500px;
  margin: 0 60px;
}

.search-wrapper {
  width: 100%;
  position: relative;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  border: 1px solid #e8e8e8;
  background: #fafafa;
  box-shadow: none;
  transition: all 0.3s ease;
  padding-left: 18px;
}

.search-input :deep(.el-input__wrapper:hover) {
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: #c9a96e;
  box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.08);
}

.search-input :deep(.el-input__inner) {
  color: #333;
  font-size: 0.9rem;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: #bfbfbf;
}

.search-input :deep(.el-input__prefix) {
  color: #999;
  margin-right: 8px;
}

/* 右侧按钮 - 简约风格 */
.header-right {
  flex: 0 0 auto;
}

.add-btn {
  border-radius: 18px;
  padding: 9px 20px;
  font-weight: 400;
  font-size: 0.9rem;
  background: #333;
  border: none;
  color: #fff;
  box-shadow: none;
  transition: all 0.25s ease;
  letter-spacing: 0.5px;
}

.add-btn:hover {
  background: #1a1a1a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>