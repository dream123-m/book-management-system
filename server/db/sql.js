const mysql = require('mysql')

let connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'123456', 
    database:'vuebooks'
})

// 建立数据库连接
connection.connect((err) => {
  if (err) {
    console.error('数据库连接失败：', err);
    return;
  }
  console.log('数据库连接成功！'); 
});

module.exports = connection