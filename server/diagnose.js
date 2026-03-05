const fs = require('fs');
const path = require('path');

console.log('============================================');
console.log('🚀 开始完整诊断流程');
console.log('============================================');

// 步骤1：检查文件是否存在
console.log('\n📁 步骤1：检查文件存在性');
console.log('--------------------------------------------');

const filesToCheck = [
  'app.js',
  'routes/index.js',
  'db/sql.js',
  'bin/www'
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} 存在 (${stats.size} 字节)`);
  } else {
    console.log(`❌ ${file} 不存在`);
  }
});

// 步骤2：检查 app.js 内容
console.log('\n📄 步骤2：检查 app.js 内容');
console.log('--------------------------------------------');

const appJsPath = path.join(__dirname, 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');
console.log(`app.js 内容长度: ${appJsContent.length} 字符`);
console.log('app.js 前100字符:');
console.log(appJsContent.substring(0, 100) + '...');
console.log('app.js 最后50字符:');
console.log('...' + appJsContent.substring(appJsContent.length - 50));

// 步骤3：检查 app.js 中是否有 console.log
if (appJsContent.includes('console.log')) {
  console.log('✅ app.js 中包含 console.log 语句');
} else {
  console.log('❌ app.js 中不包含 console.log 语句');
}

// 步骤4：测试直接加载 app.js
console.log('\n🔄 步骤3：测试直接加载 app.js');
console.log('--------------------------------------------');

try {
  // 清除缓存
  delete require.cache[require.resolve('./app')];
  
  console.log('开始加载 app.js...');
  const app = require('./app');
  console.log('✅ app.js 加载成功');
  console.log(`app 类型: ${typeof app}`);
  
  if (typeof app === 'function') {
    console.log('✅ app 是一个函数（Express应用）');
  } else {
    console.log('❌ app 不是一个函数');
  }
} catch (error) {
  console.log('❌ app.js 加载失败');
  console.log(`错误信息: ${error.message}`);
}

// 步骤5：测试加载路由模块
console.log('\n🔄 步骤4：测试加载 routes/index.js');
console.log('--------------------------------------------');

try {
  delete require.cache[require.resolve('./routes/index')];
  
  console.log('开始加载 routes/index.js...');
  const indexRouter = require('./routes/index');
  console.log('✅ routes/index.js 加载成功');
  console.log(`indexRouter 类型: ${typeof indexRouter}`);
  
  if (indexRouter && indexRouter.stack) {
    console.log(`✅ indexRouter 是路由器，有 ${indexRouter.stack.length} 个路由层`);
    
    // 列出路由
    console.log('注册的路由:');
    indexRouter.stack.forEach((layer, i) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
        console.log(`  ${i+1}. ${methods} ${layer.route.path}`);
      }
    });
  } else {
    console.log('❌ indexRouter 不是有效的路由器');
  }
} catch (error) {
  console.log('❌ routes/index.js 加载失败');
  console.log(`错误信息: ${error.message}`);
}

// 步骤6：测试数据库连接
console.log('\n🗄️  步骤5：测试数据库连接');
console.log('--------------------------------------------');

try {
  delete require.cache[require.resolve('./db/sql')];
  
  console.log('开始加载 db/sql.js...');
  const connection = require('./db/sql');
  console.log('✅ db/sql.js 加载成功');
  console.log(`connection 类型: ${typeof connection}`);
  
  // 测试连接
  connection.connect(err => {
    if (err) {
      console.log('❌ 数据库连接测试失败:', err.message);
    } else {
      console.log('✅ 数据库连接测试成功');
      connection.end(); // 关闭测试连接
    }
    
    // 步骤7：完整模拟启动
    console.log('\n🚀 步骤6：完整模拟启动流程');
    console.log('--------------------------------------------');
    
    try {
      // 重新加载所有模块（模拟重启）
      delete require.cache[require.resolve('./app')];
      delete require.cache[require.resolve('./routes/index')];
      delete require.cache[require.resolve('./db/sql')];
      
      const express = require('express');
      const testApp = require('./app');
      
      console.log('✅ 完整模拟启动成功');
      console.log(`测试应用类型: ${typeof testApp}`);
      
      // 检查是否有测试路由
      const testRouter = require('./routes/index');
      testApp.use('/', testRouter);
      
      // 启动测试服务器
      const PORT = 3001;
      const testServer = require('http').createServer(testApp);
      
      testServer.listen(PORT, () => {
        console.log(`✅ 测试服务器启动在 http://localhost:${PORT}`);
        
        // 测试几个关键路由
        console.log('\n🔗 测试路由访问:');
        console.log(`1. http://localhost:${PORT}/ (根路由)`);
        console.log(`2. http://localhost:${PORT}/test (测试路由)`);
        console.log(`3. http://localhost:${PORT}/api/books/booksList (API路由)`);
        
        // 10秒后关闭测试服务器
        setTimeout(() => {
          console.log('\n⏰ 测试完成，关闭测试服务器...');
          testServer.close();
          process.exit(0);
        }, 10000);
      });
      
    } catch (fullError) {
      console.log('❌ 完整模拟启动失败');
      console.log(`错误信息: ${fullError.message}`);
      console.log('错误堆栈:', fullError.stack);
    }
  });
  
} catch (dbError) {
  console.log('❌ db/sql.js 加载失败');
  console.log(`错误信息: ${dbError.message}`);
}