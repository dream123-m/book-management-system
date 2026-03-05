// src/stores/useBookStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/common/api/request.js'
import { sortOptions } from '@/config/bookConfig.js'
 
export const useBookStore = defineStore('book', () => {
  // ============ 状态（State） ============
  const booksList = ref([])        // 书籍列表（从后端拿到的原始数据）
  const searchValue = ref('')      // 搜索关键词
  const filterType = ref('1')     // 当前筛选分类（'1'表示全部）
  const loading = ref(false)       // 加载状态
 
  // ============ Getters ============
  // 根据分类筛选后的书籍列表
  const filteredBooks = computed(() => {
    if (filterType.value === '1') {
      return booksList.value
    }
    const targetLabel = sortOptions.find(item => item.value === filterType.value)?.label
    return booksList.value.filter(book => book.type === targetLabel)
  })
 
  // 书籍总数
  const totalCount = computed(() => booksList.value.length)
 
  // 从后端加载书籍列表
  const loadBooks = async () => {
    loading.value = true
    try {
      const res = await request.get('/api/books', {
        params: { searchName: searchValue.value }
      })
      booksList.value = res.data.map(book => ({
        ...book,
        rating: Number(book.rating) || 0,
        latestProgress: Number(book.latestProgress) || 0
      }))
    } catch (error) {
      console.error('加载书籍失败:', error)
    } finally {
      loading.value = false
    }
  }
 
  // 修改搜索词并重新加载
  const setSearch = (keyword) => {
    searchValue.value = keyword
    loadBooks()
  }
 
  // 修改筛选分类
  const setFilterType = (type) => {
    filterType.value = type
  }
 
  // 删除书籍（从列表中移除，避免重新请求）
  const removeBook = (bookId) => {
    booksList.value = booksList.value.filter(book => book.id !== bookId)
  }
 
  return {
    booksList,
    searchValue,
    filterType,
    loading,
    filteredBooks,
    totalCount,
    loadBooks,
    setSearch,
    setFilterType,
    removeBook
  }
})