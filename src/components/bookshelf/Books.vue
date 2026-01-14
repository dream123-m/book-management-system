<template>
  <div class="bookshelf-content">
    <ul>
      <li v-for="book in booksList" :key="book.id">
        <div class="book-info">
          <div class="book-cover">
            <img :src="book.cover" alt="封面">
          </div>
          <div class="book-detail">
            <div class="book-title">书名：{{book.title}}</div>
            <div class="book-author">作者：{{book.author}}</div>
            <div class="book-type">类型：{{book.type}}</div>
            <!-- 书籍状态：显示在读或者已读 -->
            <div class="book-status">状态：{{book.status === 'reading' ? '在读' : '已读'}}</div>
            <div class="book-rating">
              <el-rate v-model="book.rating"
                show-score 
                text-color="#ff9900" 
                score-template="{value}分" />
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
import { ref, computed, onMounted } from 'vue';
import bookStorage from '@/utils/bookStorage.js'; // 导入工具
import { ElRate } from 'element-plus';
const booksList = ref([]);

// 初始化：从 localStorage 加载数据
onMounted(() => {
  booksList.value = bookStorage.fetch();
  //初始化两条示例数据
  if (booksList.value.length === 0) {
    booksList.value = [
      {
        id: 1,
        title: '活着',
        author: '余华',
        type: '人文',
        status: 'read',
        rating: 4.8,
        cover: 'https://img9.doubanio.com/view/subject/s/public/s29869926.jpg',
        highlight: '“活着”在我们中国的语言中充满了力量...'
      },
      {
        id: 2,
        title: '小王子',
        author: '圣埃克苏佩里',
        type: '科幻',
        status: 'reading',
        rating: 4.9,
        cover: 'https://img9.doubanio.com/view/subject/s/public/s3254244.jpg',
        highlight: '一个人给驯服了，就得有流泪的准备...'
      },{
        id: 3,
        title: '明朝那些事儿',
        author: '当年明月',
        type: '历史',
        status: 'reading',
        rating: 4.9,
        cover: 'https://img9.doubanio.com/view/subject/s/public/s3745215.jpg',
        highlight: '一个人给驯服了，就得有流泪的准备...'
      }
    ];
    bookStorage.save(booksList.value); // 保存初始数据
  }
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