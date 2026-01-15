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
          placeholder="请输入书名、作者或关键词" 
          :prefix-icon="Search"
          clearable
          class="search-input"
        />
      </div>
    </div>
    
    <!-- 右侧区域：操作按钮 -->
    <div class="header-right">
      <el-button 
        type="primary" 
        class="add-btn"
        @click="goAddBooks"
      >
        添加书籍
      </el-button>
    </div>
  </div>
</template>

<script setup>
// 导入图标组件
import { Search} from '@element-plus/icons-vue';
import router from '@/router'; // 导入路由实例

// 跳转添加书籍页面
const goAddBooks = () => {
  router.push('/addbooks');
}
</script>

<style scoped>
/* 基础布局 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 100;
}

/* 左侧Logo区域 */
.header-left {
  flex: 0 0 auto;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo::before {
  content: "📚";
  font-size: 1.8rem;
}

/* 中间搜索区域 */
.header-center {
  flex: 1;
  max-width: 600px;
  margin: 0 40px;
}

.search-wrapper {
  width: 100%;
  position: relative;
}

.search-input {
  width: 100%;
}

/* 深度选择器修改Element Plus组件内部样式 */
.search-input :deep(.el-input__wrapper) {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  padding-left: 20px;
}

.search-input :deep(.el-input__wrapper:hover) {
  background: white;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.search-input :deep(.el-input__inner) {
  color: #333;
  font-size: 0.95rem;
}

.search-input :deep(.el-input__prefix) {
  color: #764ba2;
  margin-right: 8px;
}

/* 右侧按钮区域 */
.header-right {
  flex: 0 0 auto;
}

.add-btn {
  border-radius: 10px;
  padding: 20px 20px;
  margin:10px;
  font-weight: 600;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
}

</style>