<template>
  <div class="bookshelf-content">
    <ul>
      <li v-for="book in filteredBooks" :key="book.id">
        <div class="book-info">
          <div class="book-cover">
            <img :src="book.cover" alt="封面">
          </div>
          <div class="book-detail">
            <div class="book-title">书名：{{book.title}}</div>
            <div class="book-author">作者：{{book.author}}</div>
            <div class="book-type">类型：{{book.type}}</div>
            <div class="book-status">状态：{{statusText.find(item => item.value === book.status).label}}</div>
            <div class="book-rating">
              <el-rate v-model="book.rating"
                show-score 
                text-color="#ff9900" 
                score-template="{value}分" />
              <el-button type="primary" @click="updateRating(book)">提交评分</el-button>
            </div>
            <div class="book-intro">亮点：{{book.highlight}}</div>
            
            <!-- 操作按钮 -->
            <div class="book-actions">
              <el-button size="small" type="primary" @click="editBook(book)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteBook(book.id)">删除</el-button>
            </div>
          </div>
        </div>
      </li>
    </ul>
    
    <!-- ========== 编辑弹窗（重点） ========== -->
    <el-dialog 
      v-model="editDialogVisible" 
      title="编辑书籍信息" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="100px">
        <!-- 书名 -->
        <el-form-item label="书名" required>
          <el-input 
            v-model="editForm.title" 
            placeholder="请输入书名"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <!-- 作者 -->
        <el-form-item label="作者">
          <el-input 
            v-model="editForm.author" 
            placeholder="请输入作者"
            maxlength="50"
          />
        </el-form-item>
        
        <!-- 类型（单选） -->
        <el-form-item label="类型">
          <el-radio-group v-model="editForm.type">
            <el-radio 
              v-for="item in sortOptions.filter(s => s.value !== '1')" 
              :key="item.value" 
              :value="item.label"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 阅读状态（单选） -->
        <el-form-item label="阅读状态" required>
          <el-radio-group v-model="editForm.status">
            <el-radio 
              v-for="item in statusText" 
              :key="item.value" 
              :value="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 亮点 -->
        <el-form-item label="书籍亮点">
          <el-input 
            v-model="editForm.highlight" 
            type="textarea"
            :rows="4"
            placeholder="请输入书籍亮点或简介"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <!-- 封面（可选，暂时不改） -->
        <el-form-item label="封面URL">
          <el-input 
            v-model="editForm.cover" 
            placeholder="封面图片链接（可选）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/common/api/request.js';
import { statusText } from '@/config/bookConfig.js';

const booksList = ref([]);
const editDialogVisible = ref(false);
const editForm = ref({
  id: null,
  title: '',
  author: '',
  type: '',
  status: '',
  highlight: '',
  cover: ''
});

const props = defineProps({
  filterType: {
    type: String,
    required: true
  },
  sortOptions: {
    type: Array,
    required: true
  }
});

// 过滤书籍列表
const filteredBooks = computed(() => {
  const filterType = props.filterType;
  if (filterType === '1') {
    return booksList.value;
  }
  return booksList.value.filter(book => 
    book.type === props.sortOptions.find(item => item.value === filterType).label
  );
});

// 加载书籍列表
const loadBooksList = async () => {
  try {
    const res = await request.get('/api/books');
    booksList.value = res.data.map(book => ({
      ...book,
      rating: parseFloat(book.rating) || 0
    }));
    console.log('✅ 书籍数据加载成功');
  } catch (error) {
    console.error('❌ 加载失败:', error);
  }
};

const editBook = (book) => {
  editForm.value = {
    id: book.id,
    title: book.title,
    author: book.author,
    type: book.type,
    status: book.status,
    highlight: book.highlight,
    cover: book.cover
  };
  console.log('准备编辑:', editForm.value);
  editDialogVisible.value = true;
};

const submitEdit = async () => {
  //  表单验证
  if (!editForm.value.title?.trim()) {
    ElMessage.error('书名不能为空');
    return;
  }
  
  if (!editForm.value.status) {
    ElMessage.error('请选择阅读状态');
    return;
  }
  
  try {
    // 发送请求
    const res = await request.put(`/api/books/${editForm.value.id}`, {
      title: editForm.value.title.trim(),
      author: editForm.value.author || '佚名',
      type: editForm.value.type || '其他',
      status: editForm.value.status,
      highlight: editForm.value.highlight || '暂无简介',
      cover: editForm.value.cover
    });
    // 关闭弹窗 + 提示
    editDialogVisible.value = false
    ElMessage.success(res.message || '修改成功')
    // 重新加载列表
    await loadBooksList()
  } catch (error) {
    console.error('❌ 编辑失败:', error)
    // 错误提示已经在拦截器中处理了
  }
};

// 删除书籍
const deleteBook = async (bookId) => {
  try {
    await ElMessageBox.confirm('确定要删除这本书吗？删除后无法恢复！', '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    });
    const res = await request.delete(`/api/books/${bookId}`);
    ElMessage.success(res.message || '删除成功');
    booksList.value = booksList.value.filter(book => book.id !== bookId);
  } catch (error) {
    if (error === 'cancel') return;
    console.error(' 删除失败:', error);
  }
};

const updateRating = async (book) => {
  try {
    await request.put(`/api/books/${book.id}/rating`, { rating: book.rating });
    ElMessage.success('评分已更新');
  } catch (error) {
    console.error('评分更新失败:', error);
  }
};

onMounted(() => {
  loadBooksList();
});
</script>

<style scoped>
.bookshelf-content {
  padding: 20px 24px;
  max-width: auto;
  margin: 0 auto;
}

.bookshelf-content ul {
  list-style: none;
  padding: 0;
  /* 核心：三列网格布局 */
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 一行三列 */
  gap: 48px; /* 卡片间距 */
}

/* 卡片基础样式 */
.bookshelf-content li {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  /* 内部采用左右布局 */
  display: flex;
  height: 440px; /* 固定高度，让一行整齐 */
}

.bookshelf-content li:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: #e6f7ff;
}

/* 书的信息区域：左文右图 */
.book-info {
  display: flex;
  width: 100%;
  /* 默认即为 row，文字在左，图片在右 */
}

/* 左侧：文字详情区域 */
.book-detail {
  flex: 1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止文本溢出 */
}

.book-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
  line-height: 1.4;
  /* 标题过长显示省略号 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 12px;
}

/* 修改点2：标签、状态、评分在同一行 */
.book-meta {
  display: flex;
  align-items: center;
  gap: 10px; /* 元素间间距 */
  margin-bottom: 15px;
  flex-wrap: wrap; /* 如果空间不足可以换行 */
}

.book-type,
.book-status {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
  white-space: nowrap;
}

.book-type {
  background-color: #f0f7ff;
  color: #1890ff;
  border: 1px solid #d1e9ff;
}

.book-status.reading {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffe7ba;
}
.book-status.read {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #d9f7be;
}

/* 评分组件适配 */
.book-rating {
  display: flex;
  align-items: center;
}
.book-rating :deep(.el-rate) {
  display: flex;
}
.book-rating :deep(.el-rate__icon) {
  font-size: 0.9rem !important;
  margin-right: 1px;
}

/* 亮点介绍 */
.book-intro {
  flex-grow: 1;
  color: #595959;
  line-height: 1.5;
  font-size: 0.85rem;
  margin-bottom: 15px;
  /* 限制显示行数 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 底部按钮区域 */
.book-footer {
  margin-top: auto; /* 将按钮推到底部 */
}

/* 修改点3：美化写笔记按钮 */
.book-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1.5px solid #d9d9d9;
  border-radius: 6px;
  color: #595959;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.book-btn:hover {
  background-color: #fafafa;
  border-color: #1890ff;
  color: #1890ff;
}

.btn-icon {
  font-size: 0.9rem;
}

/* 右侧：封面区域 */
.book-cover {
  flex-shrink: 0;
  width: 270px; /* 固定宽度，适应三列布局 */
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.bookshelf-content li:hover .book-cover img {
  transform: scale(1.08);
}
</style>