// src/utils/bookStorage.js
const STORAGE_KEY = 'my-book-list';

export default {
  // 获取所有图书
  fetch() {
    const books = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // 为已有图书补充id（如果是从空开始，这一步不是必须的）
    books.forEach((book, index) => {
      if (!book.id) book.id = Date.now() + index;
    });
    return books;
  },
  // 保存所有图书
  save(books) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  },
   // 更新单本图书的数据
  update(updatedBook) {
    // 1. 先获取本地存储中的所有书籍
    const books = this.fetch(); // 调用自身的fetch方法，获取完整数组
    // 2. 遍历数组，找到与更新书籍id一致的项，替换它
    const updatedBooks = books.map(book => {
      // 匹配id：只有id一致的书籍，才用新数据替换
      if (book.id === updatedBook.id) {
        return { ...book, ...updatedBook }; // 合并新旧数据，新数据（updatedBook）覆盖旧数据
      }
      // id不一致的书籍，保持原样
      return book;
    });
    // 把修改后的完整数组，重新保存回localStorage（整存整取的关键）
    this.save(updatedBooks);
    //返回更新后的完整数组
    return updatedBooks;
  }
};