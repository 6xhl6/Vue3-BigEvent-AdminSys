<script setup>
import { Delete, Edit } from '@element-plus/icons-vue'
import { ref, watch, onMounted } from 'vue'
import ChannelSelect from './components/ChannelSelect.vue'
import { getArticleList, getArticleChannelList, deleteArticle } from '@/api/article'
import { formatDate } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import ArticleEdit from './components/ArticleEdit.vue'

const articleList = ref([])
const channelList = ref([])
const params = ref({
  pagenum: 1,
  pagesize: '3',
  cate_id: '',
  state: '已发布'
})
const total = ref(0)

onMounted(async () => {
  const channelRes = await getArticleChannelList()
  channelList.value = channelRes.data.data
  const res = await getArticleList(params.value)
  articleList.value = res.data.data
  total.value = res.data.total
})

const initParams = {
  pagenum: 1,
  pagesize: '3',
  cate_id: '',
  state: '已发布'
}

const onSearch = async () => {
  const res = await getArticleList(params.value)
  articleList.value = res.data.data
  total.value = res.data.total
}
const onReset = () => {
  params.value = { ...initParams }
  onSearch()
}

const handleSizeChange = (val) => {
  params.value.pagesize = String(val)
}

const drawer = ref(null)
const onAdd = () => {
  drawer.value.open({})
}
const onEdit = (row) => {
  drawer.value.open(row)
}
const onDelete = (row) => {
  ElMessageBox.confirm('确认删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteArticle(row.id)
    console.log(res)
    ElMessage.success('删除成功')
    onSearch()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
// 处理提交后刷新数据，若添加成功，刷新到最后一页
const handleRefresh = (mode) => {
  if (mode === 'add') {
    params.value.pagenum = Math.ceil((total.value + 1) / Number(params.value.pagesize))
  }
  onSearch()
}


watch(params, (newVal) => {
  console.log(newVal)
}, { deep: true })

</script>

<template>
  <PageContainer title="文章管理">
    <template #extra>
      <el-button type="primary" auto-insert-space @click="onAdd">
        添加文章
      </el-button>
    </template>
    <el-form inline label-width='auto' class="inline-form">
      <el-form-item label="文章分类：">
        <ChannelSelect v-model:cate_id="params.cate_id" v-model:articleList="articleList"
          v-model:channelList="channelList" />
      </el-form-item>
      <el-form-item label="发布状态：">
        <el-select placeholder="请选择" v-model="params.state" @change="onSearch">
          <el-option label="已发布" value="已发布"></el-option>
          <el-option label="草稿" value="草稿"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="articleList" style="width: 100%">
      <el-table-column label="文章标题" width="400">
        <template #default="{ row }">
          <el-link type="primary" :underline="'never'">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="分类" prop="cate_name"></el-table-column>
      <el-table-column label="发表时间" prop="pub_date">
        <template #default="{ row }">
          {{ formatDate(row.pub_date) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="state"></el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button :icon="Edit" circle plain type="primary" @click="onEdit(row)"></el-button>
          <el-button :icon="Delete" circle plain type="danger" @click="onDelete(row)"></el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>
    <el-pagination background layout="prev, pager, next, sizes, total" v-model:current-page="params.pagenum" :total="total"
      :page-size="Number(params.pagesize)" :page-sizes="[3, 5, 7, 10]" @size-change="handleSizeChange"
      @change="onSearch" />
    <ArticleEdit ref="drawer" v-model:articleList="articleList" v-model:channelList="channelList" @refresh="handleRefresh" />
  </PageContainer>

</template>

<style scoped>
.inline-form {
  .el-select {
    width: 150px;
  }
}

.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
