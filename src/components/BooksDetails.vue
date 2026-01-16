<template>
  <div class="book-detail-page">
    <!-- 左侧：图书信息 -->
    <div class="book-info-section">
      <div class="book-cover-large">
        <img :src="bookInfo.cover" alt="封面">
      </div>
      <h2>{{ bookInfo.title }}</h2>
      <p class="meta-info">
        <span class="label">作者：</span>{{ bookInfo.author }}
      </p>
      <p class="meta-info">
        <span class="label">分类：</span>{{ bookInfo.type }}
      </p>
      <p class="meta-info">
        <span class="label">状态：</span>{{ bookInfo.status }}
      </p>
      
      <div class="rating-section">
        <el-rate v-model="bookInfo.rating" disabled show-score />
      </div>
      
      <div class="highlight-section">
        <div class="section-title">📖 书籍亮点</div>
        <p class="highlight-text">{{ bookInfo.highlight }}</p>
      </div>
      
      <div class="action-btns">
        <el-button type="primary" @click="showAddDialog = true">
          📝 添加阅读记录
        </el-button>
        <el-button @click="router.back()">
          ← 返回
        </el-button>
      </div>
    </div>
    

    <!-- 右侧：阅读记录时间线 -->
<div class="records-section">
  <div class="section-header">
    <h3>📅 阅读记录</h3>
    <span class="record-count">共 {{ records.length }} 条</span>
  </div>
  
  <el-timeline v-if="records.length > 0">
    <el-timeline-item v-for="record in records" :key="record.id" :timestamp="formatDate(record.read_date)" placement="top">
      <el-card shadow="hover">
        <div class="record-header">
          <el-tag type="success" size="large">
            进度：{{ record.progress }}%
          </el-tag>
          <span class="pages-info">
            📄 {{ record.current_page }} / {{ record.total_pages }} 页
          </span>
          <span v-if="record.duration" class="duration-info">
            ⏱️ {{ record.duration }} 分钟
          </span>
          
          <!-- 删除按钮 -->
          <el-button 
            type="danger" 
            size="small" 
            :icon="Delete"
            circle
            @click="deleteRecord(record.id)"
            class="delete-btn"
          />
        </div>
        
        <el-progress :percentage="Number(record.progress)"  :stroke-width="12" :color="getProgressColor(record.progress)" style="margin: 16px 0"/>
        
        <div v-if="record.notes" class="notes-section">
          <div class="notes-title">💭 读书笔记</div>
          <p class="notes-content">{{ record.notes }}</p>
        </div>
      </el-card>
    </el-timeline-item>
  </el-timeline>
  
  <el-empty v-else description="还没有阅读记录，快去添加吧！" />
</div>
    
    <!-- 添加记录弹窗 -->
    <el-dialog  v-model="showAddDialog"  title="添加阅读记录"  width="550px" :close-on-click-modal="false" >
      <el-form :model="recordForm" label-width="120px">
        <el-form-item label="阅读日期" required>
          <el-date-picker  v-model="recordForm.read_date" type="date" placeholder="选择日期" style="width: 100%"/>
        </el-form-item>
        
        <el-form-item label="当前阅读页数" required>
          <el-input-number  v-model="recordForm.current_page" :min="1" :max="recordForm.total_pages"  placeholder="读到第几页" style="width: 100%"/>
          <div class="form-tip">你已经读到第几页了？</div>
        </el-form-item>
        
        <el-form-item label="书籍总页数" required>
          <el-input-number  v-model="recordForm.total_pages" :min="1" placeholder="这本书总共多少页"
            style="width: 100%"
          />
          <div class="form-tip">这本书总共有多少页？</div>
        </el-form-item>
        
        <el-form-item label="自动计算进度">
          <div class="progress-preview">
            <el-progress 
              :percentage="calculateProgress()" 
              :stroke-width="15"
              :color="getProgressColor(calculateProgress())"
            />
            <span class="progress-value">{{ calculateProgress() }}%</span>
          </div>
        </el-form-item>
        
        <el-form-item label="阅读时长">
          <el-input-number  v-model="recordForm.duration" :min="0" style="width: 100%"/> 分钟
          <div class="form-tip">本次阅读花了多少时间？（选填）</div>
        </el-form-item>
        
        <el-form-item label="读书笔记">
          <el-input  v-model="recordForm.notes" type="textarea" :rows="5" placeholder="记录你的想法、感悟、摘抄..." maxlength="1000" show-word-limit/>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRecord" :loading="isSubmitting">
          确定添加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';  // ← 关键：两个都要引入
import request from '@/common/api/request.js';
import { Delete } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const bookId = route.query.id;

const bookInfo = ref({});
const records = ref([]);
const showAddDialog = ref(false);
const isSubmitting = ref(false);

const recordForm = ref({
  read_date: new Date(),
  current_page: 1,
  total_pages: 100,
  duration: 30,
  notes: ''
});

// 计算进度
const calculateProgress = () => {
  const { current_page, total_pages } = recordForm.value;
  if (!current_page || !total_pages || total_pages === 0) {
    return 0;
  }
  return ((current_page / total_pages) * 100).toFixed(2);
};

// 进度条颜色
const getProgressColor = (progress) => {
  const p = parseFloat(progress) || 0;
  if (p >= 80) return '#67c23a';
  if (p >= 50) return '#409eff';
  if (p >= 20) return '#e6a23c';
  return '#f56c6c';
};

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// 加载图书信息
const loadBookInfo = async () => {
  try {
    const res = await request.get(`/api/books/${bookId}`);
    bookInfo.value = {
      ...res.data,
      rating: Number(res.data.rating) || 0  
    };
    if (bookInfo.value.total_pages) {
      recordForm.value.total_pages = bookInfo.value.total_pages;
    }
  } catch (error) {
    ElMessage.error('加载书籍信息失败');
    router.back();
  }
};

// 加载阅读记录
const loadRecords = async () => {
  try {
    const res = await request.get(`/api/books/${bookId}/records`);
    records.value = res.data.map(record => ({
      ...record,
      progress: Number(record.progress) || 0,  
      current_page: Number(record.current_page) || 0,  
      total_pages: Number(record.total_pages) || 0,  
      duration: Number(record.duration) || 0  
    }));
  } catch (error) {
    console.error('加载记录失败:', error);
  }
};

// 提交记录
const submitRecord = async () => {
  // 验证
  if (!recordForm.value.read_date) {
    ElMessage.error('请选择阅读日期');
    return;
  }
  if (!recordForm.value.current_page || recordForm.value.current_page <= 0) {
    ElMessage.error('请输入当前阅读页数');
    return;
  }
  if (!recordForm.value.total_pages || recordForm.value.total_pages <= 0) {
    ElMessage.error('请输入书籍总页数');
    return;
  }
  if (recordForm.value.current_page > recordForm.value.total_pages) {
    ElMessage.error('当前页数不能大于总页数');
    return;
  }
  isSubmitting.value = true;
  try {
    // 格式化日期
    const dateStr = new Date(recordForm.value.read_date).toISOString().split('T')[0];
    
    await request.post(`/api/books/${bookId}/records`, {
      read_date: dateStr,
      current_page: recordForm.value.current_page,
      total_pages: recordForm.value.total_pages,
      duration: recordForm.value.duration,
      notes: recordForm.value.notes
    });
    ElMessage.success('添加成功');
    showAddDialog.value = false;
    // 重置表单
    recordForm.value = {
      read_date: new Date(),
      current_page: 1,
      total_pages: recordForm.value.total_pages, // 保留总页数
      duration: 30,
      notes: ''
    };
    // 刷新记录列表
    await loadRecords();
  } catch (error) {
    console.error('添加失败:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// 删除阅读记录
const deleteRecord = async (recordId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条阅读记录吗？删除后无法恢复！',
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    const res = await request.delete(`/api/books/${bookId}/records/${recordId}`);
    ElMessage.success(res.message || '删除成功');
    // 从列表中移除
    records.value = records.value.filter(r => r.id !== recordId);
  } catch (error) {
    if (error === 'cancel') return;
    console.error('删除失败:', error);
  }
};

onMounted(() => {
  if (!bookId) {
    ElMessage.error('书籍ID不存在');
    router.back();
    return;
  }
  
  loadBookInfo();
  loadRecords();
});
</script>

<style scoped>

  /* 删除按钮样式 */
.record-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  position: relative;
}

.delete-btn {
  margin-left: auto;  /* 推到最右边 */
  opacity: 0.7;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  opacity: 1;
  transform: scale(1.1);
} 
.book-detail-page {
  display: flex;
  gap: 32px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: #faf8f3;
  min-height: calc(100vh - 64px);
}

/* 左侧：图书信息 */
.book-info-section {
  flex: 0 0 320px;
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(139, 115, 85, 0.08);
  height: fit-content;
  position: sticky;
  top: 24px;
}

.book-cover-large {
  width: 100%;
  margin-bottom: 24px;
}

.book-cover-large img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.book-info-section h2 {
  font-size: 1.5rem;
  color: #3d3020;
  margin-bottom: 16px;
  font-family: 'STKaiti', 'KaiTi', serif;
}

.meta-info {
  font-size: 0.95rem;
  color: #5a4a3a;
  margin-bottom: 8px;
}

.meta-info .label {
  color: #8b7355;
  font-weight: 500;
}

.rating-section {
  margin: 20px 0;
  padding: 16px;
  background: #faf8f3;
  border-radius: 8px;
}

.highlight-section {
  margin: 20px 0;
  padding: 16px;
  background: #f5f0e8;
  border-radius: 8px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #5a4a3a;
  margin-bottom: 12px;
}

.highlight-text {
  line-height: 1.8;
  color: #3d3020;
  font-family: 'STKaiti', 'KaiTi', serif;
}

.action-btns {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.action-btns :deep(.el-button) {
width: 100%;
}
/* 右侧：阅读记录 */
.records-section {
flex: 1;
background: #fff;
padding: 32px;
border-radius: 12px;
box-shadow: 0 2px 12px rgba(139, 115, 85, 0.08);
}
.section-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 24px;
}
.section-header h3 {
font-size: 1.3rem;
color: #3d3020;
margin: 0;
}
.record-count {
font-size: 0.9rem;
color: #8b7355;
}
.record-header {
display: flex;
gap: 16px;
align-items: center;
margin-bottom: 12px;
flex-wrap: wrap;
}
.pages-info,
.duration-info {
font-size: 0.9rem;
color: #5a4a3a;
}
.notes-section {
margin-top: 16px;
padding: 16px;
background: #faf8f3;
border-radius: 8px;
border-left: 3px solid #c9a96e;
}
.notes-title {
font-size: 0.9rem;
font-weight: 600;
color: #5a4a3a;
margin-bottom: 12px;
}
.notes-content {
line-height: 1.8;
color: #3d3020;
font-family: 'STKaiti', 'KaiTi', serif;
white-space: pre-wrap;
}
/* 表单样式 */
.form-tip {
font-size: 0.85rem;
color: #8b7355;
margin-top: 4px;
}
.progress-preview {
display: flex;
align-items: center;
gap: 16px;
width: 100%;
}
.progress-preview :deep(.el-progress) {
flex: 1;
}
.progress-value {
font-size: 1.2rem;
font-weight: 600;
color: #409eff;
min-width: 60px;
text-align: right;
}
</style>