<template>
<div class="bookshelf">
    <Header @search="handleSearch" />
    <!-- 向sort组件传递当前排序类型，并监听sortChange事件 -->
    <Sort :currentSortType="sortType" :sortOptions="sortOptions" @sortChange="handleSortChange" />
    <!-- 传递filterType给Books组件，根据排序类型过滤显示的书籍 -->
    <Books :filterType="sortType" :sortOptions="sortOptions" :searchValue="searchValue" />
</div>
</template>

<script setup>
import Header from '../components/bookshelf/Header.vue'
import Sort from '../components/bookshelf/Sort.vue'
import Books from '../components/bookshelf/Books.vue'
import { ref } from 'vue'
import {sortOptions } from '@/config/bookConfig.js'

const sortType = ref('1') 
// 搜索框输入值
const searchValue = ref('');

// 处理排序类型改变事件
const handleSortChange = (newSortType) => {
  console.log('父组件收到排序变化:', newSortType)
  sortType.value = newSortType
}

// 处理搜索关键词事件
const handleSearch = (keyword) => {
  console.log('父组件收到搜索关键词:', keyword)
  searchValue.value = keyword
}

</script>

<style scoped>
.bookshelf {
    height: 100%;
    width: 100%;
}
</style>