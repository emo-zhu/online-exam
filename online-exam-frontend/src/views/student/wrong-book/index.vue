<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>错题本</span>
          <div class="header-actions">
            <el-radio-group v-model="activeSubject" size="small" @change="handleFilter">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button v-for="item in subjectOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <div class="wrong-list" v-if="filteredList.length > 0">
        <div v-for="item in filteredList" :key="item.id" class="wrong-item">
          <div class="item-header">
            <div class="left">
              <el-tag :type="getTypeTag(item.type)" size="small" effect="dark" class="mr-2">{{ getTypeName(item.type) }}</el-tag>
              <RichContent class="question-title" :html="item.title" />
            </div>
            <div class="right-actions">
              <el-button type="primary" link @click="toggleDetail(item)">
                {{ item.showDetail ? '收起解析' : '查看解析' }}
              </el-button>

              <el-popconfirm title="确定已掌握并移出错题本吗？" @confirm="handleRemove(item.id)">
                <template #reference>
                  <el-button type="danger" link>移除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>

          <div class="item-meta">
            <span class="meta-tag"><el-icon><Document /></el-icon> {{ item.examName }}</span>
            <span class="meta-tag"><el-icon><Clock /></el-icon> {{ item.createTime }}</span>
          </div>

          <el-collapse-transition>
            <div class="item-detail-box" v-if="item.showDetail">
              <div class="options-list" v-if="item.options">
                <div
                  v-for="(val, key) in item.options"
                  :key="key"
                  class="opt-row"
                  :class="{
                    'is-correct': isOptionCorrect(item, key),
                    'is-wrong': isOptionSelected(item, key) && !isOptionCorrect(item, key)
                  }"
                >
                  <span class="key">{{ key }}.</span>
                  <RichContent class="val" :html="val" />
                  <el-icon v-if="isOptionCorrect(item, key)" class="status-icon success"><Select /></el-icon>
                  <el-icon v-if="isOptionSelected(item, key) && !isOptionCorrect(item, key)" class="status-icon danger"><CloseBold /></el-icon>
                </div>
              </div>

              <div class="answer-analysis">
                <div class="row">
                  <span class="label">我的答案：</span>
                  <span class="val danger">{{ formatAnswer(item.myAnswer) || '未作答' }}</span>
                </div>
                <div class="row">
                  <span class="label">正确答案：</span>
                  <div v-if="['text', 'fill', 'application'].includes(item.type)" class="val success rich-text-val">
                    <RichContent :html="item.answer" />
                  </div>
                  <span v-else class="val success">{{ formatAnswer(item.answer) }}</span>
                </div>
                <div class="row" v-if="item.analysis">
                  <span class="label">解析：</span>
                  <div class="val rich-text-val">
                    <RichContent :html="item.analysis" />
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </div>

      <el-empty v-else description="暂无错题记录，继续加油！" />
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import RichContent from '@/components/RichContent.vue'
import { deleteWrongBook, getWrongBookList } from '@/api/examRecord'
import { getSubjectList } from '@/api/subject'
import { ElMessage } from '@/utils/element-plus'
import { normalizeSubjectOptions } from '@/utils/subject'

const activeSubject = ref('all')
const listData = ref([])
const loading = ref(false)
const subjectOptions = ref([])

const filteredList = computed(() => {
  if (activeSubject.value === 'all') return listData.value
  return listData.value.filter(item => item.subject === activeSubject.value)
})

const fetchSubjectOptions = async () => {
  const { data } = await getSubjectList()
  subjectOptions.value = normalizeSubjectOptions(data || [])
}

const refreshList = async (showSuccess = false) => {
  loading.value = true
  try {
    const { data } = await getWrongBookList()
    listData.value = (data || []).map(item => ({
      ...item,
      showDetail: false
    }))
    if (showSuccess) {
      ElMessage.success('刷新成功')
    }
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
}

const handleRemove = async (id) => {
  await deleteWrongBook(id)
  listData.value = listData.value.filter(item => item.id !== id)
  ElMessage.success('已移出错题本')
}

const toggleDetail = (item) => {
  item.showDetail = !item.showDetail
}

const getTypeName = (type) => ({
  judge: '单选题',
  select: '多选题',
  fill: '填空题',
  text: '简答题',
  application: '应用题'
}[type] || '题目')
const getTypeTag = (type) => ({
  judge: 'primary',
  select: 'warning',
  fill: 'info',
  text: 'success',
  application: 'primary'
}[type] || '')

const formatAnswer = (ans) => {
  if (Array.isArray(ans)) return ans.join(', ')
  return ans
}

const isOptionCorrect = (item, key) => {
  const correct = item.answer
  if (Array.isArray(correct)) return correct.includes(key)
  return correct === key
}

const isOptionSelected = (item, key) => {
  const my = item.myAnswer
  if (Array.isArray(my)) return my && my.includes(key)
  return my === key
}

onMounted(async () => {
  await fetchSubjectOptions()
  await refreshList()
})
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wrong-item {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;

  .left {
    display: flex;
    align-items: flex-start;
    flex: 1;
    min-width: 0;
    padding-right: 20px;
  }
}

.question-title {
  flex: 1;
  min-width: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.7;
  color: #303133;
}

.mr-2 {
  margin-right: 10px;
  margin-top: 2px;
}

.item-meta {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 13px;
  margin-bottom: 15px;
  padding-left: 2px;

  .meta-tag {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

.item-detail-box {
  background: #f9f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
  border-top: 1px solid #eee;
}

.options-list {
  margin-bottom: 15px;
}

.opt-row {
  display: flex;
  align-items: flex-start;
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 5px;
  font-size: 14px;

  &.is-correct {
    background: #f0f9eb;
    color: #67c23a;
  }

  &.is-wrong {
    background: #fef0f0;
    color: #f56c6c;
  }

  .key {
    font-weight: bold;
    width: 25px;
    flex-shrink: 0;
  }

  .val {
    flex: 1;
    min-width: 0;
  }

  .status-icon {
    margin-left: 10px;
    font-weight: bold;
  }
}

.answer-analysis {
  padding-top: 10px;
  border-top: 1px dashed #e4e7ed;
}

.row {
  margin-bottom: 8px;
  font-size: 14px;
  display: flex;
  align-items: flex-start;

  .label {
    color: #606266;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .val {
    font-weight: bold;
    flex: 1;
    min-width: 0;
  }

  .success {
    color: #67c23a;
  }

  .danger {
    color: #f56c6c;
  }
}

.rich-text-val {
  font-weight: normal;
}
</style>
