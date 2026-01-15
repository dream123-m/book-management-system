<template>
  <div>
    <div class="addbooks-header">
       <h1>添加新书籍</h1>
    </div>
    <div class="addbooks-form">
      <!-- 封面区域 -->
      <div class='addbooks-cover'>
        <img :src="form.cover" alt="" class="cover-img" />
        <div class="cover-tip">封面</div>
        <!-- 简化上传：先支持默认封面，后续可扩展实际上传逻辑 -->
        <el-upload
          class="avatar-uploader"
          :auto-upload="false"
          :on-change="handleCoverChange"
          accept="image/*"
        >
          <el-button size="small" type="primary">选择封面图片</el-button>
        </el-upload>
      </div>

      <div class="addbooks-content">
        <span>书籍名称：</span>
        <el-input v-model="form.title" placeholder="请输入书名" maxlength="30"/>
        <span>作者：</span>
        <el-input v-model="form.author" placeholder="请输入作者" maxlength="30" />
        <!-- 单选框选类型 -->
         <span>类型：</span>
         <el-radio-group v-model="form.type">
        <!-- 将 label 拆分为 value 和 label -->
        <el-radio v-for="item in sortOptions" :key="item.value" :value="item.value" :label="item.label" />
        </el-radio-group>
            <!-- 书籍状态：显示已读，在读，未读 -->
            <div class="book-status">状态：
              <el-radio-group v-model="form.status">
                <el-radio v-for="item in statusText" :key="item.value" :value="item.value" :label="item.label" />
              </el-radio-group>
            </div>
            <div class="book-rating">
              <el-rate v-model="form.rating"
                show-score 
                text-color="#ff9900"  />
            </div>
           <div class="form-item">
             <label>书籍亮点</label>
            <el-input v-model="form.highlight" type="textarea" placeholder="选填，不填默认「暂无简介」" rows="2"/>
           </div>
      </div>
    </div>
    <div class="addbooks-btn">
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button type="info" @click="resetForm">重置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { sortOptions, statusText } from '@/config/bookConfig.js'

const form = ref({
  cover: '', // 封面url
  title: '', // 书名（必填）
  author: '', // 作者
  type: '', // 类型
  status: '', // 状态（必填）
  rating: '', // 评分
  highlight: '' // 亮点
})

const defaultBookConfig = {
  cover: '/img/cover-1.png', // 默认封面在public/img目录下
  author: '佚名', // 默认作者
  type: '其他', // 类型
  rating: 5.0, // 默认评分
  highlight: '暂无简介' // 默认亮点
}

// 重置表单,清空所有字段
const resetForm = () => {
  form.value = {
    cover: '',
    title: '',
    author: '',
    type: '',
    status: '',
    rating: '',
    highlight: ''
  }
  ElMessage.info('表单已重置')
}
const handleCoverChange = (file) => {
  // 简化处理：直接将文件路径赋值给form.cover
  form.value.cover = URL.createObjectURL(file.raw);
}

// 提交表单
const submitForm = () => {
  if (!form.value.title  || !form.value.status ) {
    ElMessage.error('请填写书名和状态');
    return;
  }
  // 在localStorage校验名字是否唯一
  const books = JSON.parse(localStorage.getItem('books')) || [];
  if (books.some(book => book.title === form.value.title)) {
    ElMessage.error('书名已存在');
    return;
  }
  //如果有空值补全默认值
  form.forEach((item) => {
    if (!item) {
      item = defaultBookConfig[item];
    }
  })
  // 然后添加到localStorage里,id递增
  const newBook = {
    ...form.value,
    id: books.length + 1
  }
  books.push(newBook);
  localStorage.setItem('books', JSON.stringify(books));

  // 提交逻辑
  ElMessage.success('添加成功');
};

</script>
