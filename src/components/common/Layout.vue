<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <aside class="layout-sidebar">
      <div class="logo">📖 图书管理系统</div>
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
  background-color: #f5f3ef;
}

.layout-sidebar {
  width: 200px;
  background-color: #2f343a;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* Logo：像馆藏标题 */
.logo {
  color: #eae7e2;
  padding: 22px 16px;
  font-size: 1.05rem;
  font-weight: 500;
  text-align: center;
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* 菜单 */
.sidebar-menu {
  flex: 1;
  background-color: transparent;
  border-right: none;
}

/*菜单项  */
:deep(.el-menu-item) {
  padding-left: 24px !important;
  margin: 6px 10px;
  border-radius: 6px;
  color: #cfd3d6 !important;
  font-size: 0.95rem;
  transition: background-color 0.25s ease, color 0.25s ease;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.06) !important;
  color: #ffffff !important;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(198, 174, 120, 0.18) !important;
  color: #f3ead7 !important;
  font-weight: 600;
}

:deep(.el-icon) {
  color: #bfc5c9;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #c6ae78;
}

/*右侧内容区 */
.layout-main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-main {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background-color: #f5f3ef;
}

</style>
