<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <aside class="layout-sidebar">
      <div class="logo">📚 图书管理</div>
      <el-menu 
        :default-active="activeIndex" 
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/home">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/bookshelf">
          <el-icon><Reading /></el-icon>
          <span>书架管理</span>
        </el-menu-item>
        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <span>关于</span>
        </el-menu-item>
      </el-menu>
    </aside>
    
    <!-- 右侧主内容区 -->
    <div class="layout-main-container">
      <main class="layout-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { House, Reading, InfoFilled } from '@element-plus/icons-vue';

const route = useRoute();
const activeIndex = ref(route.path);

watch(() => route.path, (newPath) => {
  activeIndex.value = newPath;
});
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.layout-sidebar {
  /* px-to-viewport-ignore-next */
  width: 200px; /* PC 网页侧边栏 180-220px 比较合适 */
  background-color: #304156;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* 防止被压缩 */
}

.logo {
  color: white;
  /* px-to-viewport-ignore-next */
  padding: 20px;
  /* px-to-viewport-ignore-next */
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

/* 菜单项样式优化 */
:deep(.el-menu-item) {
  /* px-to-viewport-ignore-next */
  padding-left: 20px !important;
  border-left: 3px solid transparent;
  transition: all 0.3s;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.15) !important;
  border-left-color: #409EFF;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(64, 158, 255, 0.08) !important;
}

.layout-main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-main {
  flex: 1;
  /* px-to-viewport-ignore-next */
  padding: 5px;
  overflow-y: auto;
  background-color: #f0f2f5;
}
</style>
