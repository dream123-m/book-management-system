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
            <!-- 书籍状态：显示在读或者已读 -->
            <div class="book-status">状态：{{statusText.find(item => item.value === book.status).label}}</div>
            <div class="book-rating">
              <el-rate v-model="book.rating"
                show-score 
                text-color="#ff9900" 
                score-template="{value}分" />
                <!-- 提交评分更新在localStorage -->
                <el-button type="primary" @click="updateRating(book)">提交评分</el-button>
            </div>
            <div class="book-btn">
                <button>写笔记</button>
            </div>
            <div class="book-intro">亮点：{{book.highlight}}</div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>


<script setup>
import { ref, computed, onMounted,defineProps } from 'vue';
import bookStorage from '@/utils/bookStorage.js'; // 导入工具
import { ElRate } from 'element-plus';
import { statusText } from '@/config/bookConfig.js';
const booksList = ref([]);
import request from '@/common/api/request.js'


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

// 初始化：从数据库加载数据
// 【新增】：编写加载书籍数据的函数（调用 request 封装）
const loadBooksList = async () => {
  try {
    const data = await request.$axios({
      url: '/api/books',  // 改为/api/books
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