<script setup>
const channelList = defineModel('channelList')
const cate_id = defineModel('cate_id')

// // 当 cate_name 或 channelList 变化时，自动推导 cate_id
// watch([cate_name, channelList], ([name, list]) => {
//   if (name && list?.length) {
//     const target = list.find(item => item.cate_name === name)
//     cate_id.value = target?.id || ''
//     emit('refresh')
//   }
// }, { immediate: true })
// watch(cate_id, (newVal) => {
//   emit('refresh')
// })

</script>

<template>
  <el-select placeholder="请选择" v-model="cate_id">
    <el-option v-for="item in channelList" :key="item.id" :label="item.cate_name" :value="item.id"></el-option>
  </el-select>
</template>
