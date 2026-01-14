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
  }
};