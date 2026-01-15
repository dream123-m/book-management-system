<template>
<div class="bookshelf">
    <Header />
    <!-- 向sort组件传递当前排序类型，并监听sortChange事件 -->
    <Sort :currentSortType="sortType" :sortOptions="sortOptions" @sortChange="handleSortChange" />
    <!-- 传递filterType给Books组件，根据排序类型过滤显示的书籍 -->
    <Books :filterType="sortType" :sortOptions="sortOptions"/>
</div>
</template>

<script setup>
import Header from '../components/bookshelf/Header.vue'
import Sort from '../components/bookshelf/Sort.vue'
import Books from '../components/bookshelf/Books.vue'
import { ref } from 'vue'
import {sortOptions } from '@/config/bookConfig.js'

const sortType = ref('1') 

// 处理排序类型改变事件
const handleSortChange = (newSortType) => {
  console.log('父组件收到排序变化:', newSortType)
  sortType.value = newSortType
}

</script>

<style scoped>
.bookshelf {
    height: 100%;
    width: 100%;
}
</style>