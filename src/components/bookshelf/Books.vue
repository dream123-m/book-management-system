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
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/common/api/request.js';
import { statusText } from '@/config/bookConfig.js';

const router = useRouter();
const booksList = ref([]);
const editDialogVisible = ref(false);
const editForm = ref({});


// 获取父组件传递的排序类型
const props = defineProps({
  filterType: {
    type: String,
    required: true
  },
  sortOptions: {
    type: Array,
    required: true
  }
})

// 提交评分
const updateRating = (book) => {
  bookStorage.update(book);
}

// 根据 filterType 过滤书籍
const filteredBooks = computed(() => {
  const filterType = props.filterType;
  console.log(filterType)
  if (filterType === '1') {
    return booksList.value; // 全部显示
  }
  return booksList.value.filter(book => book.type === props.sortOptions.find(item => item.value === filterType).label);
});

// 编写加载书籍数据（调用 request 封装）
const loadBooksList = async () => {
  try {
    const data = await request.$axios({
      url: '/api/books',  
      method: 'GET',
      params: {}
    });
    
    console.log('获取到的数据:', data); // 这里打印数据，看看是什么
    
    if (data && Array.isArray(data)) {
      booksList.value = data.map(book => ({
        ...book,
        rating: parseFloat(book.rating) || 0
      }));
      console.log('书籍数据加载成功：', booksList.value);
    } else {
      console.error('返回的数据不是数组或为空:', data);
    }
  } catch (error) {
    console.error('书籍数据加载失败：', error);
  }
};

// 初始化：从数据库加载数据
onMounted(() => {
  loadBooksList(); // 调用请求函数，完成数据加载
});

// ========== 编辑功能（重点） ==========
const editBook = (book) => {
  // 深拷贝所有需要编辑的字段
  editForm.value = {
    id: book.id,
    title: book.title,
    author: book.author,
    type: book.type,
    status: book.status,
    highlight: book.highlight,
    cover: book.cover
  };
  
  console.log('准备编辑的书籍:', editForm.value);
  editDialogVisible.value = true;
};

// 提交编辑
const submitEdit = async () => {
  // 1. 表单验证
  if (!editForm.value.title || !editForm.value.title.trim()) {
    ElMessage.error('书名不能为空');
    return;
  }
  
  if (!editForm.value.status) {
    ElMessage.error('请选择阅读状态');
    return;
  }
  
  try {
    // 2. 调用后端接口
    const result = await request.$axios({
      url: `/api/books/${editForm.value.id}`,
      method: 'PUT',
      data: {
        title: editForm.value.title.trim(),
        author: editForm.value.author || '佚名',
        type: editForm.value.type || '其他',
        status: editForm.value.status,
        highlight: editForm.value.highlight || '暂无简介',
        cover: editForm.value.cover
      }
    });
    
    console.log('编辑返回结果:', result);
    
    // 3. 检查返回结果
    if (result.code === 1) {
      ElMessage.success('✅ 修改成功');
      editDialogVisible.value = false;
      loadBooksList(); // 刷新列表
    } else {
      ElMessage.error('修改失败: ' + (result.message || '未知错误'));
    }
    
  } catch (error) {
    console.error('❌ 编辑请求失败:', error);
    
    // 4. 错误处理
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 409) {
        ElMessage.error('❌ 书名已存在，请使用其他书名');
      } else if (status === 404) {
        ElMessage.error('❌ 书籍不存在');
      } else if (status === 400) {
        ElMessage.error('❌ ' + (errorData.message || '请填写完整信息'));
      } else {
        ElMessage.error('❌ 修改失败: ' + (errorData.message || '未知错误'));
      }
    } else {
      ElMessage.error('❌ 网络错误，请检查服务器');
    }
  }
};



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