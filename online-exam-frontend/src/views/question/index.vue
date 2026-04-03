<template>
  <div class="app-container">
    <el-card shadow="hover" class="premium-card">
      <div class="filter-container">
        <div class="filter-item">
          <span class="label">题干搜索</span>
          <el-input
            v-model="queryParams.title"
            placeholder="输入题目关键字"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </div>
        <div class="filter-item">
          <span class="label">科目</span>
          <el-select
            v-model="queryParams.subject"
            placeholder="所有科目"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="item in subjectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="label">题型</span>
          <el-select
            v-model="queryParams.type"
            placeholder="所有题型"
            clearable
            style="width: 140px"
          >
            <el-option label="单选题" value="judge" />
            <el-option label="多选题" value="select" />
            <el-option label="填空题" value="fill" />
            <el-option label="简答题" value="text" />
            <el-option label="应用题" value="application" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="label">分类</span>
          <el-select
            v-model="queryParams.categoryId"
            placeholder="请选择分类"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="c in filterCategories(queryParams.subject)"
              :key="c.id"
              :label="c.name"
              :value="String(c.id)"
            />
          </el-select>
        </div>

        <div class="filter-buttons">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button type="primary" icon="Plus" @click="handleAdd"
            >新增试题</el-button
          >
          <el-button
            type="danger"
            plain
            :disabled="!ids.length"
            @click="handleBatchDelete"
            >批量删除</el-button
          >
        </div>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="type" label="题型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{
              getTypeLabel(row.type)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="科目" width="110" align="center">
          <template #default="{ row }">
            {{ row.subjectName || getSubjectLabel(row.subject) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="titleText"
          label="题干内容"
          min-width="260"
          show-overflow-tooltip
        />
        <el-table-column label="分类" width="140" align="center">
          <template #default="{ row }">
            {{ getCategoryName(row.categoryId) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="score"
          label="默认分值"
          width="100"
          align="center"
        />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button link type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <span class="total-text">共 {{ total }} 条</span>
        <el-pagination
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          background
          layout="prev, pager, next, sizes, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="980px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="科目" prop="subject">
              <el-select
                v-model="form.subject"
                placeholder="请选择"
                @change="handleSubjectChange"
              >
                <el-option
                  v-for="item in subjectOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类" prop="categoryId">
              <el-select
                v-model="form.categoryId"
                placeholder="请选择分类"
                :disabled="!form.subject"
              >
                <el-option
                  v-for="c in filterCategories(form.subject)"
                  :key="c.id"
                  :label="c.name"
                  :value="c.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="题型" prop="type">
              <el-select
                v-model="form.type"
                placeholder="请选择"
                @change="handleTypeChange"
              >
                <el-option label="单选题" value="judge" />
                <el-option label="多选题" value="select" />
                <el-option label="填空题" value="fill" />
                <el-option label="简答题" value="text" />
                <el-option label="应用题" value="application" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="题干" prop="title">
          <RichTextEditor
            v-model="form.title"
            placeholder="请输入题干，可插入图片和公式"
            :min-height="220"
          />
        </el-form-item>

        <el-form-item label="默认分数" prop="score">
          <el-input-number v-model="form.score" :min="1" />
        </el-form-item>

        <div
          v-if="form.type === 'judge' || form.type === 'select'"
          class="option-panel"
        >
          <div
            v-for="opt in ['A', 'B', 'C', 'D']"
            :key="opt"
            class="option-row"
          >
            <div class="option-header">
              <el-tag size="small">选项 {{ opt }}</el-tag>
              <el-radio
                v-if="form.type === 'judge'"
                v-model="form.answer"
                :label="opt"
                >正确答案</el-radio
              >
              <el-checkbox v-else v-model="form.answers" :label="opt"
                >正确答案</el-checkbox
              >
            </div>
            <RichTextEditor
              v-model="form.options[opt]"
              :show-tip="false"
              :min-height="140"
              placeholder="请输入选项内容"
            />
          </div>
        </div>

        <el-form-item
          v-if="['text', 'fill', 'application'].includes(form.type)"
          label="参考答案"
          prop="answer"
        >
          <RichTextEditor
            v-model="form.answer"
            placeholder="请输入参考答案，可使用公式"
            :min-height="180"
          />
        </el-form-item>

        <el-form-item label="题目解析" prop="analysis">
          <RichTextEditor
            v-model="form.analysis"
            placeholder="请输入题目解析，可为空"
            :min-height="180"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import RichTextEditor from "@/components/RichTextEditor.vue";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import {
  createQuestion,
  deleteQuestion,
  batchDeleteQuestions,
  getQuestionList,
  updateQuestion,
} from "@/api/question";
import { getQuestionCategoryList } from "@/api/questionCategory";
import { getSubjectList } from "@/api/subject";
import {
  buildSubjectNameMap,
  getSubjectDisplayName,
  normalizeSubjectOptions,
} from "@/utils/subject";

const subjectiveQuestionTypes = ["text", "fill", "application"];

const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const ids = ref([]);
const categoryOptions = ref([]);
const subjectOptions = ref([]);
const subjectNameMap = computed(() =>
  buildSubjectNameMap(subjectOptions.value),
);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: "",
  subject: "",
  type: "",
  categoryId: "",
});

const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref();
const form = reactive({
  id: undefined,
  subject: "",
  categoryId: null,
  type: "judge",
  title: "",
  score: 2,
  options: { A: "", B: "", C: "", D: "" },
  answer: "",
  answers: [],
  analysis: "",
});

const rules = {
  subject: [{ required: true, message: "请选择科目", trigger: "change" }],
  type: [{ required: true, message: "请选择题型", trigger: "change" }],
  title: [{ required: true, message: "请输入题干", trigger: "blur" }],
};

const buildQueryParams = () => ({
  pageNum: queryParams.pageNum,
  pageSize: queryParams.pageSize,
  title: queryParams.title || undefined,
  subject: queryParams.subject || undefined,
  type: queryParams.type || undefined,
  categoryId: queryParams.categoryId || undefined,
});

const resetFormState = () => {
  Object.assign(form, {
    id: undefined,
    subject: "",
    categoryId: null,
    type: "judge",
    title: "",
    score: 2,
    options: { A: "", B: "", C: "", D: "" },
    answer: "A",
    answers: [],
    analysis: "",
  });
};

const fetchSubjectOptions = async () => {
  const { data } = await getSubjectList();
  subjectOptions.value = normalizeSubjectOptions(data || []);
};

const fetchCategoryOptions = async () => {
  const { data } = await getQuestionCategoryList({ pageNum: 1, pageSize: 100 });
  categoryOptions.value = data.list || [];
};

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getQuestionList(buildQueryParams());
    tableData.value = data.list || [];
    total.value = data.total || 0;
    ids.value = [];
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchData();
};

const handleSelectionChange = (selection) => {
  ids.value = selection.map((item) => item.id);
};

const handleSubjectChange = () => {
  form.categoryId = null;
};

const handleTypeChange = () => {
  if (subjectiveQuestionTypes.includes(form.type)) {
    form.options = { A: "", B: "", C: "", D: "" };
    form.answer = typeof form.answer === "string" ? form.answer : "";
    form.answers = [];
    return;
  }

  if (form.type === "judge") {
    form.options = {
      A: form.options?.A || "",
      B: form.options?.B || "",
      C: form.options?.C || "",
      D: form.options?.D || "",
    };
    form.answer =
      typeof form.answer === "string" && form.answer ? form.answer : "A";
    form.answers = [];
    return;
  }

  form.options = {
    A: form.options?.A || "",
    B: form.options?.B || "",
    C: form.options?.C || "",
    D: form.options?.D || "",
  };
  form.answer = "";
  form.answers = Array.isArray(form.answers) ? form.answers : [];
};

const handleAdd = () => {
  dialogTitle.value = "新增试题";
  dialogVisible.value = true;
  resetFormState();
  formRef.value?.clearValidate();
};

const handleEdit = (row) => {
  dialogTitle.value = "编辑试题";
  dialogVisible.value = true;
  Object.assign(form, {
    id: row.id,
    subject: row.subject,
    categoryId: row.categoryId,
    type: row.type,
    title: row.title || "",
    score: row.score,
    options: subjectiveQuestionTypes.includes(row.type)
      ? { A: "", B: "", C: "", D: "" }
      : row.options || { A: "", B: "", C: "", D: "" },
    answer: row.answer || (row.type === "judge" ? "A" : ""),
    answers: row.answers || [],
    analysis: row.analysis || "",
  });
  formRef.value?.clearValidate();
};

const handleDelete = (row) => {
  ElMessageBox.confirm("确认删除该试题吗？", "警告", { type: "warning" })
    .then(async () => {
      await deleteQuestion(row.id);
      ElMessage.success("删除成功");
      if (tableData.value.length === 1 && queryParams.pageNum > 1) {
        queryParams.pageNum -= 1;
      }
      fetchData();
    })
    .catch(() => {});
};

const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确认删除选中的 ${ids.value.length} 道试题吗？`,
    "警告",
    { type: "warning" },
  )
    .then(async () => {
      await batchDeleteQuestions(ids.value);
      ElMessage.success("批量删除成功");
      if (
        tableData.value.length === ids.value.length &&
        queryParams.pageNum > 1
      ) {
        queryParams.pageNum -= 1;
      }
      fetchData();
    })
    .catch(() => {});
};

const buildQuestionPayload = () => ({
  subject: form.subject,
  categoryId: form.categoryId || null,
  type: form.type,
  title: form.title,
  score: form.score,
  options:
    subjectiveQuestionTypes.includes(form.type)
      ? null
      : {
          A: form.options.A || "",
          B: form.options.B || "",
          C: form.options.C || "",
          D: form.options.D || "",
        },
  answer: form.type === "select" ? form.answers : form.answer,
  analysis: form.analysis || "",
});

const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  if (form.id) {
    await updateQuestion(form.id, buildQuestionPayload());
  } else {
    await createQuestion(buildQuestionPayload());
  }

  ElMessage.success("保存成功");
  dialogVisible.value = false;
  fetchData();
};

const handleSizeChange = (size) => {
  queryParams.pageNum = 1;
  queryParams.pageSize = size;
  fetchData();
};

const handlePageChange = (page) => {
  queryParams.pageNum = page;
  fetchData();
};

const getSubjectLabel = (subject, subjectName = "") => {
  return getSubjectDisplayName(subject, subjectNameMap.value, subjectName);
};

const getTypeLabel = (type) => {
  const map = {
    judge: "单选题",
    select: "多选题",
    text: "简答题",
    fill: "填空题",
    application: "应用题",
  };
  return map[type] || type;
};

const getTypeTag = (type) => {
  const map = {
    judge: "",
    select: "success",
    text: "warning",
    fill: "info",
    application: "primary",
  };
  return map[type] || "info";
};

const filterCategories = (subject) => {
  if (!subject) return categoryOptions.value;
  return categoryOptions.value.filter((item) => item.subject === subject);
};

const getCategoryName = (id) => {
  if (!id) return "-";
  const category = categoryOptions.value.find((item) => item.id === id);
  return category ? category.name : "-";
};

onMounted(async () => {
  resetFormState();
  await Promise.all([fetchSubjectOptions(), fetchCategoryOptions()]);
  await fetchData();
});
</script>

<style scoped lang="scss">
.option-panel {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 8px;
  background: #f8f8f8;
}

.option-row + .option-row {
  margin-top: 16px;
}

.option-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>
