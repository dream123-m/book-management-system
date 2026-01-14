<template>
<div class="bookshelf">
    <Header />
    <Sort />
    <Books />
</div>
</template>

<script setup>
import Header from '../components/bookshelf/Header.vue'
import Sort from '../components/bookshelf/Sort.vue'
import Books from '../components/bookshelf/Books.vue'
</script>

<style scoped>
.bookshelf {
    height: 100%;
    width: 100%;
}
</style>