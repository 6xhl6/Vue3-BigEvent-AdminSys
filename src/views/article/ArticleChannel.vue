<script setup>
import { getArticleChannelList, delArticleChannel, updateArticleChannel } from '@/api/article'
import { ref, onMounted } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ChannelEdit from '@/views/article/components/ChannelEdit.vue'

const tableData = ref([])

const getChannelList = async () => {
  const res = await getArticleChannelList()
  tableData.value = res.data.data
  console.log(tableData.value)
}

onMounted(getChannelList)

const dialog = ref(null)

const handleAdd = () => {
  dialog.value.openDialog()
}

const handleEdit = (row) => {
  dialog.value.openDialog(row)
}

const handleDelete = async (row) => {
  ElMessageBox.confirm('确认删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await delArticleChannel(row.id)
    ElMessage.success('删除成功')
    getChannelList()
  })
}

</script>

<template>
  <div class="article-channel">
    <PageContainer title="文章分类">
      <template #extra>
        <el-button type="primary" auto-insert-space @click="handleAdd">
          添加分类
        </el-button>
      </template>
      <div class="table-container">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column type="index" label='序号' width="55"></el-table-column>
          <el-table-column prop="id" label="id" width="100"></el-table-column>
          <el-table-column prop="cate_name" label="分类名称"></el-table-column>
          <el-table-column prop="cate_alias" label="分类别名"></el-table-column>
          <el-table-column label="操作" width="150">
            <!-- 作用域插槽 -->
            <template #default="{ row }">
              <el-button type="primary" plain circle :icon="Edit" @click="handleEdit(row)"></el-button>
              <el-button type="danger" plain circle :icon="Delete" @click="handleDelete(row)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <ChannelEdit ref="dialog" @refresh="getChannelList"></ChannelEdit>
      </div>
    </PageContainer>
  </div>
</template>
