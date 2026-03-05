var express = require('express');
var router = express.Router();
var connection = require('../db/sql.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 获取阅读状态统计（饼图数据
router.get('/statistics/status', function (req, res, next) {
  console.log('获取阅读状态统计');
  // 查询各状态的书籍数量 + 总数
  const sql = `
    SELECT 
      status,
      COUNT(*) as count
    FROM bookslist
    GROUP BY status
  `;
  connection.query(sql, function (error, results) {
    if (error) {
      console.error('数据库查询错误:', error);
      return res.status(500).send({
        code: 0,
        message: '服务器内部错误'
      });
    }
    // 计算总数
    const total = results.reduce((sum, item) => sum + item.count, 0);
    console.log('状态统计成功, 总书籍数:', total);
    res.send({
      code: 1,
      message: '获取成功',
      data: {
        stats: results,  
        total: total     // 总书籍数
      }
    });
  });
});

//获取阅读进度 Top10
router.get('/statistics/top-progress', function (req, res, next) {
  console.log('获取阅读进度 Top10');
  const sql = `
    SELECT 
      b.id,
      b.title,
      b.cover,
      COALESCE(
        (SELECT progress 
         FROM reading_records 
         WHERE book_id = b.id 
         ORDER BY read_date DESC, created_at DESC 
         LIMIT 1),
        0
      ) AS latestProgress
    FROM bookslist b
    WHERE b.status != 'finished'
    ORDER BY latestProgress DESC
    LIMIT 10
  `;
  connection.query(sql, function (error, results) {
    if (error) {
      console.error('数据库查询错误:', error);
      return res.status(500).send({
        code: 0,
        message: '服务器内部错误'
      });
    }
    console.log('Top10 查询成功');
    res.send({
      code: 1,
      message: '获取成功',
      data: results
    });
  });
});

// 获取本月阅读时长趋势
router.get('/statistics/month-duration', function (req, res, next) {
  console.log('获取本月阅读时长趋势');
  // 获取本月第一天和最后一天
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const lastDayStr = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
  
  const sql = `
    SELECT 
      read_date,
      SUM(duration) as totalDuration
    FROM reading_records
    WHERE read_date >= ? AND read_date <= ?
    GROUP BY read_date
    ORDER BY read_date ASC
  `;
  connection.query(sql, [firstDay, lastDayStr], function (error, results) {
    if (error) {
      console.error('数据库查询错误:', error);
      return res.status(500).send({
        code: 0,
        message: '服务器内部错误'
      });
    }
    console.log('本月时长趋势查询成功');
    res.send({
      code: 1,
      message: '获取成功',
      data: results
      // [{ read_date: '2025-01-15', totalDuration: 120 }, ...]
    });
  });
});

// 获取最近阅读记录 
router.get('/statistics/recent-records', function (req, res, next) {
  console.log('获取最近阅读记录');
  
  const sql = `
    SELECT 
      r.*,
      b.title,
      b.cover,
      b.author
    FROM reading_records r
    LEFT JOIN bookslist b ON r.book_id = b.id
    ORDER BY r.read_date DESC, r.created_at DESC
    LIMIT 10
  `;
  connection.query(sql, function (error, results) {
    if (error) {
      console.error('数据库查询错误:', error);
      return res.status(500).send({
        code: 0,
        message: '服务器内部错误'
      });
    }
    console.log('最近阅读记录查询成功');
    res.send({
      code: 1,
      message: '获取成功',
      data: results
    });
  });
});

// 删除阅读记录 
router.delete('/books/:bookId/records/:recordId', function (req, res, next) {
  const { bookId, recordId } = req.params;
  console.log('删除阅读记录 - 书籍ID:', bookId, '记录ID:', recordId);
  // 检查记录是否存在且属于该书籍
  connection.query(
    'SELECT * FROM reading_records WHERE id = ? AND book_id = ?',
    [recordId, bookId],
    function (error, results) {
      if (error) {
        console.error('数据库查询错误:', error);
        return res.status(500).send({
          code: 0,
          message: '服务器内部错误'
        });
      }
      if (results.length === 0) {
        return res.status(404).send({
          code: 0,
          message: '记录不存在'
        });
      }  
      // 删除记录
      connection.query(
        'DELETE FROM reading_records WHERE id = ?',
        [recordId],
        function (deleteError) {
          if (deleteError) {
            console.error('数据库删除错误:', deleteError);
            return res.status(500).send({
              code: 0,
              message: '删除记录失败'
            });
          }         
          console.log('阅读记录删除成功'); 
          res.send({
            code: 1,
            message: '删除成功',
            data: { id: recordId }
          });
        }
      );
    }
  );
});

// 获取某本书的阅读记录 
router.get('/books/:id/records', function (req, res, next) {
  const bookId = req.params.id;
  console.log(' 获取阅读记录 - 书籍ID:', bookId);
  connection.query(
    'SELECT * FROM reading_records WHERE book_id = ? ORDER BY read_date DESC, created_at DESC',
    [bookId],
    function (error, results) {
      if (error) {
        console.error('数据库查询错误:', error);
        return res.status(500).send({
          code: 0,
          message: '服务器内部错误'
        });
      }
      console.log(' 查询成功，记录数:', results.length);
      res.send({
        code: 1,
        message: '获取成功',
        data: results
      });
    }
  );
});

// 添加阅读记录 
router.post('/books/:id/records', function (req, res, next) {
  const bookId = req.params.id;
  const { read_date, current_page, total_pages, duration, notes } = req.body;
  console.log(' 收到添加阅读记录请求:', req.body);
  // 验证必填字段
  if (!read_date) {
    return res.status(400).send({
      code: 0,
      message: '阅读日期不能为空'
    });
  }
  if (!current_page || current_page <= 0) {
    return res.status(400).send({
      code: 0,
      message: '当前页数必须大于0'
    });
  }
  if (!total_pages || total_pages <= 0) {
    return res.status(400).send({
      code: 0,
      message: '总页数必须大于0'
    });
  }
  if (parseInt(current_page) > parseInt(total_pages)) {
    return res.status(400).send({
      code: 0,
      message: '当前页数不能大于总页数'
    });
  }
  // 自动计算进度
  const progress = ((parseInt(current_page) / parseInt(total_pages)) * 100).toFixed(2);
  console.log('计算进度:', current_page, '/', total_pages, '=', progress, '%');
  // 准备插入数据
  const recordData = {
    book_id: parseInt(bookId),
    read_date: read_date,
    current_page: parseInt(current_page),
    total_pages: parseInt(total_pages),
    progress: parseFloat(progress),
    duration: parseInt(duration) || 0,
    notes: notes || ''
  };
  // 插入数据库
  connection.query(
    'INSERT INTO reading_records SET ?',
    recordData,
    function (error, results) {
      if (error) {
        console.error('数据库插入错误:', error);
        return res.status(500).send({
          code: 0,
          message: '添加记录失败'
        });
      }
      console.log('阅读记录添加成功, ID:', results.insertId);
      res.send({
        code: 1,
        message: '添加成功',
        data: {
          id: results.insertId,
          ...recordData
        }
      });
    }
  );
});

// 获取书籍详情
router.get('/books/:id', function (req, res, next) {
  const bookId = req.params.id;
  console.log(' 获取书籍详情 - ID:', bookId);
  connection.query(
    'SELECT * FROM bookslist WHERE id = ?',
    [bookId],
    function (error, results) {
      if (error) {
        console.error('数据库查询错误:', error);
        return res.status(500).send({
          code: 0,
          message: '服务器内部错误'
        });
      }
      if (results.length === 0) {
        return res.status(404).send({
          code: 0,
          message: '书籍不存在'
        });
      }
      console.log(' 书籍详情获取成功');
      res.send({
        code: 1,
        message: '获取成功',
        data: results[0]
      });
    }
  );
});

//  获取书籍列表
router.get('/books', function (req, res, next) {
  const searchName = req.query.searchName || '';
  
  // 搜索状态中英文映射
  let statusMapping = '';
  if (searchName.includes('在读') || searchName.includes('读中')) {
    statusMapping = 'reading';
  } else if (searchName.includes('已读') || searchName.includes('读完')) {
    statusMapping = 'read';
  } else if (searchName.includes('未读') || searchName.includes('待读')) {
    statusMapping = 'unread';
  }

  const sql = statusMapping 
    ? `
      SELECT 
        b.*,
        COALESCE(
          (SELECT progress 
           FROM reading_records 
           WHERE book_id = b.id 
           ORDER BY read_date DESC, created_at DESC 
           LIMIT 1),
          0
        ) AS latestProgress
      FROM bookslist b
      WHERE b.title LIKE ? OR b.author LIKE ? OR b.status = ?
    `
    : `
      SELECT 
        b.*,
        COALESCE(
          (SELECT progress 
           FROM reading_records 
           WHERE book_id = b.id 
           ORDER BY read_date DESC, created_at DESC 
           LIMIT 1),
          0
        ) AS latestProgress
      FROM bookslist b
      WHERE b.title LIKE ? OR b.author LIKE ?
    `;
  
  const params = statusMapping 
    ? ['%' + searchName + '%', '%' + searchName + '%', statusMapping]
    : ['%' + searchName + '%', '%' + searchName + '%'];
  
  connection.query(sql, params, function (error, results) {
    if (error) {
      return res.status(500).send({
        code: 0,
        message: '服务器内部错误',
      });
    }
    res.send({
      code: 1,
      data: results,
    });
  });
});

//添加新书籍
router.post('/add/books', function (req, res, next) {
  console.log('收到添加书籍请求:', req.body);
  
  const { title, status } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).send({
      code: 0,
      message: '书名不能为空'
    });
  }
  
  if (!status) {
    return res.status(400).send({
      code: 0,
      message: '状态不能为空'
    });
  }
  
  connection.query(
    'SELECT * FROM bookslist WHERE title = ?',
    [title.trim()],
    function (error, results) {
      if (error) {
        console.error('数据库查询错误:', error);
        return res.status(500).send({
          code: 0,
          message: '服务器内部错误'
        });
      }
      
      if (results.length > 0) {
        return res.status(409).send({
          code: 0,
          message: '书名已存在，请使用其他书名'
        });
      }
      
      let coverUrl = '/img/cover-1.png';
      if (req.body.cover && req.body.cover.trim()) {
        coverUrl = req.body.cover.trim();
      }
      
      const bookData = {
        title: title.trim(),
        author: req.body.author || '佚名',
        type: req.body.type || '其他',
        status: req.body.status,
        rating: parseFloat(req.body.rating) || 5.0,
        cover: coverUrl,
        highlight: req.body.highlight || '暂无简介'
      };
      
      connection.query(
        'INSERT INTO bookslist SET ?',
        bookData,
        function (insertError, insertResults) {
          if (insertError) {
            console.error('数据库插入错误:', insertError);
            return res.status(500).send({
              code: 0,
              message: '添加书籍失败'
            });
          }
          
          console.log('书籍添加成功，ID:', insertResults.insertId);
          
          res.send({
            code: 1,
            message: '书籍添加成功',
            data: {
              id: insertResults.insertId,
              ...bookData
            }
          });
        }
      );
    }
  );
});

//  编辑书籍
router.put('/books/:id', function (req, res, next) {
  const bookId = req.params.id;
  console.log('收到编辑书籍请求 ID:', bookId, '数据:', req.body);
  
  const { title, status } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).send({
      code: 0,
      message: '书名不能为空'
    });
  }
  
  if (!status) {
    return res.status(400).send({
      code: 0,
      message: '状态不能为空'
    });
  }
  
  connection.query(
    'SELECT * FROM bookslist WHERE id = ?',
    [bookId],
    function (error, results) {
      if (error) {
        console.error('数据库查询错误:', error);
        return res.status(500).send({
          code: 0,
          message: '服务器内部错误'
        });
      }
      
      if (results.length === 0) {
        return res.status(404).send({
          code: 0,
          message: '书籍不存在'
        });
      }
      
      connection.query(
        'SELECT * FROM bookslist WHERE title = ? AND id != ?',
        [title.trim(), bookId],
        function (error, duplicates) {
          if (error) {
            return res.status(500).send({
              code: 0,
              message: '服务器内部错误'
            });
          }
          
          if (duplicates.length > 0) {
            return res.status(409).send({
              code: 0,
              message: '书名已存在，请使用其他书名'
            });
          }
          
          const updateData = {
            title: title.trim(),
            author: req.body.author || '佚名',
            type: req.body.type || '其他',
            status: req.body.status,
            highlight: req.body.highlight || '暂无简介'
          };
          
          if (req.body.cover && req.body.cover.trim()) {
            updateData.cover = req.body.cover.trim();
          }
          
          connection.query(
            'UPDATE bookslist SET ? WHERE id = ?',
            [updateData, bookId],
            function (updateError) {
              if (updateError) {
                console.error('数据库更新错误:', updateError);
                return res.status(500).send({
                  code: 0,
                  message: '更新书籍失败'
                });
              }
              
              console.log('书籍更新成功, ID:', bookId);
              
              res.send({
                code: 1,
                message: '书籍更新成功',
                data: {
                  id: bookId,
                  ...updateData
                }
              });
            }
          );
        }
      );
    }
  );
});

// 更新评分
router.put('/books/:id/rating', function (req, res, next) {
  const bookId = req.params.id;
  const { rating } = req.body;
  
  console.log('收到更新评分请求 ID:', bookId, '评分:', rating);
  
  if (rating === undefined || rating === null) {
    return res.status(400).send({
      code: 0,
      message: '评分不能为空'
    });
  }
  
  const ratingValue = parseFloat(rating);
  if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
    return res.status(400).send({
      code: 0,
      message: '评分必须在0-5之间'
    });
  }
  
  connection.query(
    'SELECT * FROM bookslist WHERE id = ?',
    [bookId],
    function (error, results) {
      if (error) {
        console.error('数据库查询错误:', error);
        return res.status(500).send({
          code: 0,
          message: '服务器内部错误'
        });
      }
      
      if (results.length === 0) {
        return res.status(404).send({
          code: 0,
          message: '书籍不存在'
        });
      }
      
      connection.query(
        'UPDATE bookslist SET rating = ? WHERE id = ?',
        [ratingValue, bookId],
        function (updateError) {
          if (updateError) {
            console.error('数据库更新错误:', updateError);
            return res.status(500).send({
              code: 0,
              message: '更新评分失败'
            });
          }
          console.log('评分更新成功, ID:', bookId, '评分:', ratingValue);
          
          res.send({
            code: 1,
            message: '评分更新成功',
            data: {
              id: bookId,
              rating: ratingValue
            }
          });
        }
      );
    }
  );
});

// ==================== 删除书籍 ====================
router.delete('/books/:id', function (req, res, next) {
  const bookId = req.params.id;
  console.log('收到删除书籍请求 ID:', bookId);
  
  connection.query(
    'SELECT * FROM bookslist WHERE id = ?',
    [bookId],
    function (error, results) {
      if (error) {
        return res.status(500).send({
          code: 0,
          message: '服务器内部错误'
        });
      }
      
      if (results.length === 0) {
        return res.status(404).send({
          code: 0,
          message: '书籍不存在'
        });
      }
      
      connection.query(
        'DELETE FROM bookslist WHERE id = ?',
        [bookId],
        function (deleteError) {
          if (deleteError) {
            return res.status(500).send({
              code: 0,
              message: '删除书籍失败'
            });
          }
          
          console.log('书籍删除成功, ID:', bookId);
          
          res.send({
            code: 1,
            message: '书籍删除成功',
            data: {
              id: bookId
            }
          });
        }
      );
    }
  );
});

module.exports = router;