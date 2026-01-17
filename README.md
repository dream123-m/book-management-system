# 📚 个人图书管理系统

> 一个基于 Vue3 + Express + MySQL 的轻量级图书管理系统，帮助你记录阅读轨迹、管理藏书、追踪阅读进度。

## ✨ 功能特性

### 📖 图书管理
- 添加/编辑/删除图书信息（书名、作者、分类、封面等）
- 支持按分类筛选书籍
- 搜索书名和作者（回车搜索）
- 书籍评分系统（五星评分）
- 阅读状态标记（未读/在读/已读）
- 点击进入详情页

<img width="1919" height="960" alt="image" src="https://github.com/user-attachments/assets/fdf264c5-6651-425c-9c3d-58fc52b8207e" />
<img width="1902" height="958" alt="image" src="https://github.com/user-attachments/assets/7a191f79-e8c4-4b26-99d1-b1868af46e45" />




### 📝 阅读记录
- 详情页可以记录每次阅读的页数、时长和笔记
- 自动计算阅读进度（当前页/总页数）
- 时间线方式展示阅读历程
- 支持删除和编辑阅读记录

<img width="1904" height="961" alt="image" src="https://github.com/user-attachments/assets/3e95a8ee-2d77-4d20-a57e-393fdde4d243" />


### 📊 数据统计
- 饼图展示阅读状态分布（已读/在读/未读）
- 阅读进度 Top 10 排行榜
- 本月阅读时长趋势图
- 最近阅读记录时间线
<img width="1900" height="956" alt="image" src="https://github.com/user-attachments/assets/4e1d3939-1f9e-4551-bb94-c738084869e9" />
<img width="1907" height="802" alt="image" src="https://github.com/user-attachments/assets/aea40318-1ea1-4513-86ac-b8c134138553" />

## 🛠 技术栈

### 前端
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI 组件**: Element Plus
- **图表库**: ECharts / Vue-ECharts
- **HTTP 客户端**: Axios

### 后端
- **框架**: Express.js
- **数据库**: MySQL 8.0+
- **ORM**: 原生 SQL（通过 mysql2 连接）

---

## 📦 快速开始

### 环境要求
- Node.js >= 16.0.0
- MySQL >= 8.0
- npm 或 yarn

### 1. 克隆项目
```bash
git clone https://github.com/your-username/book-management-system.git
cd book-management-system
```

### 2. 数据库配置

#### 2.1 创建数据库
```sql
CREATE DATABASE book_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2.2 创建表结构

**图书表 (bookslist)**
```sql
CREATE TABLE bookslist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL COMMENT '书名',
  author VARCHAR(50) COMMENT '作者',
  type VARCHAR(20) COMMENT '分类',
  status VARCHAR(10) NOT NULL COMMENT '阅读状态',
  rating DECIMAL(2,1) DEFAULT 5.0 COMMENT '评分',
  cover VARCHAR(255) COMMENT '封面URL',
  highlight TEXT COMMENT '书籍亮点',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**阅读记录表 (reading_records)**
```sql
CREATE TABLE reading_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT NOT NULL COMMENT '关联的书籍ID',
  read_date DATE NOT NULL COMMENT '阅读日期',
  current_page INT NOT NULL COMMENT '当前阅读到第几页',
  total_pages INT NOT NULL COMMENT '书籍总页数',
  progress DECIMAL(5,2) NOT NULL COMMENT '阅读进度',
  duration INT DEFAULT 0 COMMENT '阅读时长（分钟）',
  notes TEXT COMMENT '读书笔记',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES bookslist(id) ON DELETE CASCADE,
  INDEX idx_book_id (book_id),
  INDEX idx_read_date (read_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 2.3 配置数据库连接

修改 `server/db/sql.js`：
```javascript
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',           // 你的数据库用户名
  password: 'password',   // 你的数据库密码
  database: 'book_management'
});

module.exports = connection;
```

## 🚀 核心特性实现

### 1. 数据关联查询
通过 `book_id` 外键关联图书和阅读记录，实现：
- 图书详情页自动聚合该书的所有阅读记录
- 书架列表显示最新阅读进度（联表查询）

### 2. 自动进度计算
用户输入当前页数和总页数，系统自动计算进度：
```javascript
progress = (current_page / total_pages) * 100
```

### 3. 搜索优化
- 回车触发搜索（避免频繁请求）
- 后端 SQL 模糊匹配书名和作者
- 空结果友好提示

### 4. 表单校验
- ISBN 格式校验（978/979 开头的 13 位数字）
- 书名去重校验（防止重复录入）
- 日期逻辑校验（结束时间 > 开始时间）
- 页码范围校验（当前页 ≤ 总页数）

### 5. 响应式数据更新
- 编辑/删除后自动刷新列表
- 添加阅读记录后即时更新进度条
- 所有数据类型统一转换（String → Number）

---

## 🔧 开发规范

### 前端
- 使用 Composition API (`<script setup>`)
- 统一使用 `request.get/post/put/delete` 发送请求
- 所有数字字段从后端返回后统一用 `Number()` 转换
- 组件命名采用 PascalCase
- 样式使用 scoped 避免污染

### 后端
- 所有接口统一返回格式：
```javascript
  {
    code: 1,           // 1成功，0失败
    message: '成功',   // 提示信息
    data: { ... }      // 数据
  }
```
- 使用 HTTP 状态码标识错误类型（400/404/409/500）
- SQL 注入防护：使用参数化查询
- 敏感操作添加日志输出

---

## 📝 待优化功能
- [ ] 用户登录/注册系统
- [ ] 书籍封面本地上传（目前只支持 URL）
- [ ] 移动端适配（响应式布局）



This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
