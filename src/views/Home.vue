<template>
  <div class="home-page">
    <!-- 上部分：饼图 + Top10 -->
    <div class="top-section">
      <!-- 左：饼图 -->
      <div class="chart-card">
        <h3 class="card-title">阅读状态分布</h3>
        <div class="chart-wrapper">
          <v-chart :option="pieOption"  autoresize style="height: 300px;"/>
        </div>
      </div>
      
      <!-- 右：Top10 -->
      <div class="top-card">
        <h3 class="card-title">🏆 阅读进度 Top 10</h3>
        <div class="top-list">
          <div v-for="(book, index) in topBooks"  :key="book.id" class="top-item" @click="goToDetail(book.id)" >
            <span class="rank" :class="getRankClass(index)">{{ index + 1 }}</span>
            <span class="book-name">{{ book.title }}</span>
            <span class="progress">{{ book.latestProgress }}%</span>
          </div>
          <el-empty v-if="topBooks.length === 0" description="暂无数据" :image-size="60" />
        </div>
      </div>
    </div>
    
    <!-- 中部分：本月阅读时长趋势 -->
    <div class="middle-section">
      <div class="trend-card">
        <h3 class="card-title">📈 本月阅读时长趋势</h3>
        <div class="chart-wrapper">
          <v-chart :option="lineOption"  autoresize style="height: 280px;"/>
        </div>
      </div>
    </div>
    
    <!-- 下部分：最近阅读记录 -->
    <div class="bottom-section">
      <h3 class="section-title">最近阅读记录</h3>
      <el-timeline v-if="recentRecords.length > 0">
        <el-timeline-item v-for="record in recentRecords" :key="record.id" :timestamp="formatDate(record.read_date)" placement="top"
        >
          <div class="record-item" @click="goToDetail(record.book_id)">
            <div class="record-header">
              <img :src="record.cover || '/img/cover-1.png'" class="mini-cover">
              <div class="record-info">
                <h4>{{ record.title }}</h4>
                <p class="author">{{ record.author }}</p>
              </div>
              <div class="progress-circle">
                <el-progress 
                  type="circle" 
                  :percentage="Number(record.progress)" 
                  :width="50"
                  :stroke-width="5"
                />
              </div>
            </div>
            <div class="record-tags">
              <el-tag size="small">📄 {{ record.current_page }}/{{ record.total_pages }} 页</el-tag>
              <el-tag size="small" type="success" v-if="record.duration">⏱️ {{ record.duration }}分钟</el-tag>
            </div>
            <p v-if="record.notes" class="notes">{{ truncate(record.notes, 60) }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="还没有阅读记录" :image-size="100" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import request from '@/common/api/request.js';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

const router = useRouter();

// 数据
const statusData = ref({ stats: [], total: 0 });
const topBooks = ref([]);
const monthDuration = ref([]);
const recentRecords = ref([]);

// 饼图配置
const pieOption = computed(() => {
  const statusMap = {
    'reading': '在读',
    'read': '已读',
    'unread': '未读'
  };
  
  const colorMap = {
    'reading': '#409eff',
    'read': '#67c23a',
    'unread': '#e6a23c'
  };
  
  const data = statusData.value.stats.map(item => ({
    name: statusMap[item.status] || item.status,
    value: item.count,
    itemStyle: { color: colorMap[item.status] }
  }));
  
  return {
    title: {
      text: `总书籍\n${statusData.value.total}本`,
      left: 'center',
      top: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3d3020'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 本 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '阅读状态',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}本',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: data
      }
    ]
  };
});

// 折线图配置
const lineOption = computed(() => {
  const dates = monthDuration.value.map(item => {
    const date = new Date(item.read_date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  
  const durations = monthDuration.value.map(item => item.totalDuration);
  
  return {
    tooltip: {
      trigger: 'axis',
      formatter: '{b0}<br/>阅读时长: {c0} 分钟'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: {
        lineStyle: { color: '#e8dcc8' }
      },
      axisLabel: {
        color: '#8b7355'
      }
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      axisLine: {
        lineStyle: { color: '#e8dcc8' }
      },
      axisLabel: {
        color: '#8b7355'
      },
      splitLine: {
        lineStyle: { color: '#f5f0e8' }
      }
    },
    series: [
      {
        data: durations,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(201, 169, 110, 0.3)' },
              { offset: 1, color: 'rgba(201, 169, 110, 0.05)' }
            ]
          }
        },
        lineStyle: {
          color: '#c9a96e',
          width: 3
        },
        itemStyle: {
          color: '#c9a96e'
        }
      }
    ]
  };
});

// 排名样式
const getRankClass = (index) => {
  if (index === 0) return 'gold';
  if (index === 1) return 'silver';
  if (index === 2) return 'bronze';
  return '';
};

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diff === 0) return '今天';
  if (diff === 1) return '昨天';
  if (diff < 7) return `${diff}天前`;
  
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
};

// 文本截断
const truncate = (text, len) => {
  if (!text) return '';
  return text.length > len ? text.substring(0, len) + '...' : text;
};

// 跳转详情
const goToDetail = (id) => {
  router.push({ path: '/booksdetails', query: { id } });
};

// 加载数据
const loadStatusData = async () => {
  try {
    const res = await request.get('/api/statistics/status');
    statusData.value = res.data;
  } catch (error) {
    console.error('加载状态统计失败:', error);
  }
};

const loadTopBooks = async () => {
  try {
    const res = await request.get('/api/statistics/top-progress');
    topBooks.value = res.data.map(book => ({
      ...book,
      latestProgress: Number(book.latestProgress).toFixed(1)
    }));
  } catch (error) {
    console.error('加载Top10失败:', error);
  }
};

const loadMonthDuration = async () => {
  try {
    const res = await request.get('/api/statistics/month-duration');
    monthDuration.value = res.data;
  } catch (error) {
    console.error('加载时长趋势失败:', error);
  }
};

const loadRecentRecords = async () => {
  try {
    const res = await request.get('/api/statistics/recent-records');
    recentRecords.value = res.data.map(r => ({
      ...r,
      progress: Number(r.progress) || 0,
      current_page: Number(r.current_page) || 0,
      total_pages: Number(r.total_pages) || 0,
      duration: Number(r.duration) || 0
    }));
  } catch (error) {
    console.error('加载最近记录失败:', error);
  }
};

onMounted(() => {
  loadStatusData();
  loadTopBooks();
  loadMonthDuration();
  loadRecentRecords();
});
</script>

<style scoped>
.home-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: #faf8f3;
  min-height: calc(100vh - 64px);
  font-size: 1.08rem;
}

/* 上部分 */
.top-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card, .top-card, .trend-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(139, 115, 85, 0.08);
}

.card-title {
  font-size: 1.25rem;
  color: #3d3020;
  margin: 0 0 20px 0;
  font-weight: 600;
}

/* 图表容器，固定高度防止频闪 */
.chart-wrapper {
  width: 100%;
  height: 300px;  /* 固定高度 */
  overflow: hidden;  /* 隐藏溢出 */
}


/* Top10 列表 只允许垂直滚动 */
.top-list {
  max-height: 340px;
  overflow-y: auto;  /* 垂直滚动 */
  overflow-x: hidden;  /* 禁止横向滚动 */
  padding-right: 8px;  /* 给滚动条留空间 */
}

/* Top10 项目 防止内容撑开容器 */
.top-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #faf8f3;
  min-width: 0; 
}

.top-item:hover {
  background: #f5f0e8;
  transform: translateX(4px);
}

.rank {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  background: #e8dcc8;
  color: #5a4a3a;
  margin-right: 12px;
  flex-shrink: 0;
}

.rank.gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #8b6914;
}

.rank.silver {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #666;
}

.rank.bronze {
  background: linear-gradient(135deg, #cd7f32, #e5a662);
  color: #6b3e1a;
}

.book-name {
  flex: 1;
  font-size: 1.1rem;
  color: #3d3020;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;  /* 允许文本截断 */
}

.progress {
  font-size: 0.95rem;
  font-weight: 600;
  color: #67c23a;
  background: #f0f9ff;
  padding: 3px 10px;
  border-radius: 10px;
  
}

/* 中部分 */
.middle-section {
  margin-bottom: 24px;
}

/* 下部分 */
/* 环形进度条百分比放大*/
.progress-circle :deep(.el-progress__text) {
  font-size: 0.75rem !important;
  color: #3d3020 !important;
}

.bottom-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(139, 115, 85, 0.08);
}
.section-title {
  font-size: 1.25rem;
  color: #3d3020;
  margin: 0 0 20px 0;
  font-weight: 600;
}
.record-item {
  background: #faf8f3;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.record-item:hover {
  background: #f5f0e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 115, 85, 0.1);
}
.record-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
.mini-cover {
  width: 50px;
  height: 70px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.record-info {
  flex: 1;
  min-width: 0;
}

/* 记录标题 防止文本截断 */
.record-info h4 {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  color: #3d3020;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;  /*允许文本截断 */
}

.author {
  margin: 0;
  font-size: 1.1rem;
  color: #8b7355;
}
.progress-circle {
  pointer-events: none;  /* 禁用鼠标事件 */
  user-select: none;     /*  防止选中，不然会频闪 */
}
.record-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.record-tags :deep(.el-tag) {
  font-size: 1.1rem !important;
}

.notes {
  font-size: 1.1rem;
  color: #5a4a3a;
  line-height: 1.6;
  margin: 8px 0 0 0;
  font-family: 'STKaiti', 'KaiTi', serif;
}
</style>