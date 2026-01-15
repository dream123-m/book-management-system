<template>
  <div>
    <div class="addbooks-header">
      <h1>添加新书籍</h1>
    </div>
    
    <div class="addbooks-form">
      <!-- 封面区域 - 简化版 -->
      <div class='addbooks-cover'>
        <img :src="getCoverImage()" alt="书籍封面" class="cover-img" />
        <div class="cover-tip">
          {{ coverTipText }}
        </div>
      </div>

      <div class="addbooks-content">
        <div class="cover-input-group">
          <span>封面地址：</span>
          <el-input 
            v-model="form.cover" 
            placeholder="请输入封面URL（选填，留空使用默认封面）" 
            maxlength="200"
            @input="handleCoverUrlChange"
          />
          <div class="cover-tips">
            <p>📌 填写说明：</p>
            <p>1. 可填写网络图片URL（如：https://example.com/image.jpg）</p>
            <p>2. 可留空使用默认封面</p>
            <p class="warning">⚠️ 确保URL正确有效</p>
          </div>
        </div>
        
        <span>书籍名称：<span class="required">*</span></span>
        <el-input v-model="form.title" placeholder="请输入书名" maxlength="30"/>
        
        <span>作者：</span>
        <el-input v-model="form.author" placeholder="请输入作者" maxlength="30" />
        
        <!-- 单选框选类型 -->
        <span>类型：</span>
        <el-radio-group v-model="form.type">
          <el-radio v-for="item in sortOptions" :key="item.value" :value="item.label" :label="item.label" />
        </el-radio-group>
        
        <!-- 书籍状态：显示已读，在读，未读 -->
        <div class="book-status">
          <span>状态：<span class="required">*</span></span>
          <el-radio-group v-model="form.status">
            <el-radio v-for="item in statusText" :key="item.value" :value="item.value" :label="item.label" />
          </el-radio-group>
        </div>
        
        <div class="book-rating">
          <span>评分：</span>
          <el-rate v-model="form.rating" show-score text-color="#ff9900" />
        </div>
        
        <div class="form-item">
          <label>书籍亮点</label>
          <el-input v-model="form.highlight" type="textarea" placeholder="选填，不填默认「暂无简介」" rows="3"/>
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
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { sortOptions, statusText } from '@/config/bookConfig.js'
import request from '@/common/api/request.js'
import { useRouter } from 'vue-router'

const router = useRouter();

// 表单数据
const form = reactive({
  cover: '',      // 封面URL
  title: '',      // 书名
  author: '',     // 作者
  type: '',       // 类型
  status: '',     // 状态
  rating: 5.0,    // 评分
  highlight: ''   // 亮点
})

// 封面URL变化处理
const handleCoverUrlChange = (value) => {
  // 清空前后的空格
  form.cover = value.trim();
}

// 封面图片URL
const getCoverImage = () => {
  if (form.cover) {
    return form.cover;
  }
  return '/img/cover-1.png'; // 默认封面
}

// 封面提示文本
const coverTipText = computed(() => {
  if (form.cover) {
    return '自定义封面';
  }
  return '默认封面';
})

// 重置表单
const resetForm = () => {
  form.cover = '';
  form.title = '';
  form.author = '';
  form.type = '';
  form.status = '';
  form.rating = 5.0;
  form.highlight = '';
  ElMessage.info('表单已重置');
}

// 提交表单
const submitForm = async () => {
  // 验证必填字段
  if (!form.title || !form.title.trim()) {
    ElMessage.error('请填写书名');
    return;
  }
  
  if (!form.status) {
    ElMessage.error('请选择阅读状态');
    return;
  }
  
  // 准备提交数据
  const bookData = {
    title: form.title.trim(),
    author: form.author || '佚名',
    type: form.type || '其他',
    status: form.status,
    rating: parseFloat(form.rating) || 5.0,
    cover: form.cover || '/img/cover-1.png',
    highlight: form.highlight || '暂无简介'
  };
  
  console.log('提交书籍数据:', bookData);
  
  try {
    const result = await request.$axios({
      url: '/api/add/books',
      method: 'POST',
      data: bookData
    });
    
    console.log('后端响应:', result);
    
    // 检查 result 是否包含 id 字段 
    if (result && result.id) {
      ElMessage.success('✅ 书籍添加成功！');
      // 重置表单
      resetForm();
      // 跳转到书籍列表页
      router.push('/bookshelf');
    } else {
      ElMessage.error('❌ 添加失败，请检查数据');
    }
    
  } catch (error) {
    console.error('❌ 提交请求失败:', error);
    
    // 处理特定错误
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 409) {
        ElMessage.error('❌ ' + (errorData.message || '书名已存在，请使用其他书名'));
      } else if (status === 400) {
        ElMessage.error('❌ ' + (errorData.message || '请填写完整的书籍信息'));
      } else if (status === 500) {
        ElMessage.error('❌ 服务器内部错误，请稍后重试');
      } else {
        ElMessage.error('❌ 请求失败: ' + (errorData.message || '未知错误'));
      }
    } else if (error.request) {
      ElMessage.error('❌ 网络错误，请检查服务器是否运行');
    } else {
      ElMessage.error('❌ 请求配置错误: ' + error.message);
    }
  }
};
</script>

<style scoped>
/* 整体容器 */
.addbooks-header {
  text-align: center;
  padding: 50px 0 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  margin-bottom: 30px;
}

.addbooks-header h1 {
  font-size: 32px;
  color: #2c3e50;
  font-weight: 300;
  letter-spacing: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  position: relative;
  display: inline-block;
  padding-bottom: 15px;
  margin: 0;
}

.addbooks-header h1::after {
  content: '';
  display: block;
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #6ab04c, #7ed6df);
  margin: 15px auto 0;
  border-radius: 2px;
}

/* 表单主体 */
.addbooks-form {
  max-width: 1000px;
  margin: 0 auto 50px;
  display: flex;
  gap: 50px;
  padding: 50px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* 封面区域 */
.addbooks-cover {
  flex-shrink: 0;
  width: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 15px;
  border: 2px solid #dee2e6;
  transition: all 0.3s ease;
}

.addbooks-cover:hover {
  border-color: #6ab04c;
  background: #f1f8e9;
}

.cover-img {
  width: 200px;
  height: 260px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  transition: all 0.3s ease;
  position: relative;
}

.cover-img:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.18);
}

/* 封面为空时显示提示 */
.cover-img[src="/img/cover-1.png"] {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-img[src="/img/cover-1.png"]::before {
  content: '📖';
  font-size: 60px;
  opacity: 0.3;
}

.cover-tip {
  font-size: 16px;
  color: #495057;
  font-weight: 400;
  letter-spacing: 1px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 右侧内容区 */
.addbooks-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding: 10px 0;
}

/* 表单标签 - 必填项标记 */
.addbooks-content > span {
  font-size: 16px;
  color: #495057;
  font-weight: 500;
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  padding-left: 12px;
  border-left: 3px solid #6ab04c;
}

.required {
  color: #dc3545;
  font-weight: bold;
}

/* 封面输入组 */
.cover-input-group {
  margin-bottom: 20px;
}

.cover-tips {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
  font-size: 13px;
  color: #6c757d;
  line-height: 1.5;
  border: 1px solid #e9ecef;
}

.cover-tips p {
  margin: 5px 0;
}

.cover-tips .warning {
  color: #dc3545;
  font-weight: 500;
  margin-top: 10px;
}

/* 输入框样式 */
.addbooks-content :deep(.el-input__wrapper) {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  font-size: 16px;
}

.addbooks-content :deep(.el-input__inner) {
  font-size: 16px;
  color: #495057;
  font-weight: 300;
}

.addbooks-content :deep(.el-input__wrapper:hover) {
  border-color: #6ab04c;
}

.addbooks-content :deep(.el-input__wrapper.is-focus) {
  border-color: #6ab04c;
  box-shadow: 0 0 0 3px rgba(106, 176, 76, 0.1);
  background: white;
}

/* 单选框组 */
.el-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 5px;
}

.addbooks-content :deep(.el-radio) {
  margin-right: 15px;
}

.addbooks-content :deep(.el-radio__label) {
  color: #6c757d;
  font-size: 15px;
  font-weight: 300;
}

.addbooks-content :deep(.el-radio__input.is-checked .el-radio__inner) {
  background: #6ab04c;
  border-color: #6ab04c;
}

/* 状态区域 */
.book-status {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 16px;
  color: #495057;
  font-weight: 500;
  padding: 20px 0 10px;
}

.book-status > span:first-child {
  min-width: 60px;
}

/* 评分区域 */
.book-rating {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 0 10px;
}

.book-rating > span {
  min-width: 60px;
  font-size: 16px;
  color: #495057;
  font-weight: 500;
}

.book-rating :deep(.el-rate__icon) {
  font-size: 26px;
}

.book-rating :deep(.el-rate__text) {
  color: #6ab04c;
  font-size: 16px;
  font-weight: 400;
  margin-left: 15px;
}

/* 文本域 */
.form-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.form-item label {
  font-size: 16px;
  color: #495057;
  font-weight: 500;
  padding-left: 12px;
  border-left: 3px solid #6ab04c;
}

.form-item :deep(.el-textarea__inner) {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  color: #495057;
  font-size: 16px;
  line-height: 1.6;
  resize: vertical;
  min-height: 100px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  transition: all 0.3s ease;
}

.form-item :deep(.el-textarea__inner:focus) {
  border-color: #6ab04c;
  box-shadow: 0 0 0 3px rgba(106, 176, 76, 0.1);
  background: white;
}

/* 按钮区域 */
.addbooks-btn {
  text-align: center;
  margin: 40px 0;
  display: flex;
  justify-content: center;
  gap: 25px;
}

.addbooks-btn :deep(.el-button) {
  padding: 14px 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 400;
  transition: all 0.3s ease;
  min-width: 160px;
  letter-spacing: 1px;
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.addbooks-btn :deep(.el-button--primary) {
  background: linear-gradient(135deg, #6ab04c 0%, #7ed6df 100%);
  color: white;
}

.addbooks-btn :deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #7ed6df 0%, #6ab04c 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(106, 176, 76, 0.25);
}

.addbooks-btn :deep(.el-button--info) {
  background: linear-gradient(135deg, #a8a8a8 0%, #c8c8c8 100%);
  color: white;
}

.addbooks-btn :deep(.el-button--info:hover) {
  background: linear-gradient(135deg, #c8c8c8 0%, #a8a8a8 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .addbooks-form {
    flex-direction: column;
    padding: 40px 30px;
    gap: 40px;
  }
  
  .addbooks-cover {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .addbooks-header h1 {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .addbooks-form {
    padding: 30px 20px;
    margin: 0 15px 40px;
  }
  
  .addbooks-header {
    padding: 40px 20px 20px;
  }
  
  .addbooks-header h1 {
    font-size: 24px;
  }
  
  .addbooks-btn {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .addbooks-btn :deep(.el-button) {
    width: 100%;
    max-width: 300px;
  }
  
  .el-radio-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .addbooks-content > span {
    font-size: 15px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.addbooks-header {
  animation: fadeIn 0.6s ease-out forwards;
}

.addbooks-form {
  animation: fadeIn 0.6s ease-out 0.2s forwards;
  opacity: 0;
}

.addbooks-btn {
  animation: fadeIn 0.6s ease-out 0.4s forwards;
  opacity: 0;
}
</style>
