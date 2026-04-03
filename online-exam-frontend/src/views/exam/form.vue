<template>
  <div class="app-container">
    <el-card shadow="hover" class="premium-card" v-loading="pageLoading">
      <template #header>
        <div class="card-header">
          <span class="title">{{ isEdit ? "编辑试卷" : "创建新试卷" }}</span>
          <el-button @click="handleCancel">返回列表</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="exam-form"
      >
        <h3 class="section-title">基础配置</h3>
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="试卷名称" prop="paperName">
              <el-input
                v-model="form.paperName"
                placeholder="例如：2025年第一学期期末考试"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考试时长" prop="duration">
              <el-input-number v-model="form.duration" :min="10" :step="10" />
              <span class="ml-2">分钟</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="所属科目" prop="subject">
              <el-select
                v-model="form.subject"
                placeholder="请选择科目"
                style="width: 100%"
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
          <el-col :span="12">
            <el-form-item label="试卷总分">
              <el-input-number
                :model-value="calcRealTotal"
                :min="0"
                :max="1000"
                disabled
              />
              <span class="ml-2">分（根据题目分值自动汇总）</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择开始时间"
                style="width: 100%"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用班级">
              <el-select
                v-model="form.classIds"
                multiple
                collapse-tags
                collapse-tags-tooltip
                clearable
                filterable
                placeholder="不选择则默认全部班级可见"
                style="width: 100%"
              >
                <el-option
                  v-for="item in classOptions"
                  :key="item.id"
                  :label="item.className"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <h3 class="section-title section-spacing">
          试题管理
          <span class="section-subtitle"
            >(已添加 {{ form.questionList.length }} 道题，共
            {{ calcRealTotal }} 分；试卷总分自动按题目分值汇总)</span
          >
        </h3>

        <div class="questions-container">
          <el-empty
            v-if="form.questionList.length === 0"
            description="暂无题目，请点击下方按钮添加"
          />

          <div
            v-for="(question, index) in form.questionList"
            :key="question.__key"
            class="question-item"
          >
            <div class="q-header">
              <span class="q-index">第 {{ index + 1 }} 题</span>
              <el-select
                v-model="question.type"
                size="small"
                class="q-type-select"
                @change="handleQuestionTypeChange(question)"
              >
                <el-option label="单选题" value="judge" />
                <el-option label="多选题" value="select" />
                <el-option label="填空题" value="fill" />
                <el-option label="简答题" value="text" />
                <el-option label="应用题" value="application" />
              </el-select>
              <el-input-number
                v-model="question.score"
                size="small"
                :min="1"
                :max="50"
                class="q-score-input"
              />
              <span class="score-label">分</span>
              <el-button
                type="danger"
                icon="Delete"
                circle
                size="small"
                class="remove-btn"
                @click="removeQuestion(index)"
              />
            </div>

            <div class="q-body">
              <div class="editor-block">
                <div class="editor-label">题干</div>
                <RichTextEditor
                  v-model="question.title"
                  placeholder="请输入题干内容，可插入图片和公式"
                  :min-height="180"
                />
              </div>

              <div
                v-if="question.type === 'judge' || question.type === 'select'"
                class="options-area"
              >
                <div
                  v-for="opt in ['A', 'B', 'C', 'D']"
                  :key="opt"
                  class="option-card"
                >
                  <div class="option-card-header">
                    <el-tag size="small">选项 {{ opt }}</el-tag>
                    <el-radio
                      v-if="question.type === 'judge'"
                      v-model="question.answer"
                      :label="opt"
                      >设为正确答案</el-radio
                    >
                    <el-checkbox v-else v-model="question.answers" :label="opt"
                      >设为正确答案</el-checkbox
                    >
                  </div>
                  <RichTextEditor
                    v-model="question.options[opt]"
                    :show-tip="false"
                    :min-height="140"
                    placeholder="请输入选项内容"
                  />
                </div>
              </div>

              <div
                v-if="['text', 'fill', 'application'].includes(question.type)"
                class="editor-block"
              >
                <div class="editor-label">参考答案</div>
                <RichTextEditor
                  v-model="question.answer"
                  placeholder="请输入参考答案，可使用公式"
                  :min-height="160"
                />
              </div>

              <div class="editor-block">
                <div class="editor-label">题目解析</div>
                <RichTextEditor
                  v-model="question.analysis"
                  placeholder="请输入题目解析，可为空"
                  :min-height="160"
                />
              </div>
            </div>
          </div>

          <div class="add-bar">
            <el-button
              type="warning"
              icon="FolderOpened"
              @click="openBankDialog"
              >从题库选择</el-button
            >
            <el-divider direction="vertical" />
            <el-button
              type="success"
              plain
              icon="Plus"
              @click="addQuestion('judge')"
              >添加单选题</el-button
            >
            <el-button
              type="success"
              plain
              icon="Plus"
              @click="addQuestion('select')"
              >添加多选题</el-button
            >
            <el-button
              type="success"
              plain
              icon="Plus"
              @click="addQuestion('fill')"
              >添加填空题</el-button
            >
            <el-button
              type="primary"
              plain
              icon="Plus"
              @click="addQuestion('text')"
              >添加简答题</el-button
            >
            <el-button
              type="primary"
              plain
              icon="Plus"
              @click="addQuestion('application')"
              >添加应用题</el-button
            >
          </div>
        </div>

        <el-form-item class="submit-bar">
          <el-button type="primary" :loading="submitLoading" @click="onSubmit"
            >保存试卷</el-button
          >
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>

      <el-dialog
        v-model="bankDialogVisible"
        title="从题库导入试题"
        width="860px"
        append-to-body
      >
        <div class="filter-bar">
          <el-input
            v-model="bankSearch"
            placeholder="搜索题目..."
            class="bank-filter-item"
            clearable
          />
          <el-select
            v-model="bankSubjectFilter"
            placeholder="科目"
            class="bank-filter-item"
            clearable
          >
            <el-option
              v-for="item in subjectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select
            v-model="bankCategoryFilter"
            placeholder="分类"
            class="bank-filter-item"
            clearable
            :disabled="!bankSubjectFilter"
          >
            <el-option
              v-for="c in filterCategories(bankSubjectFilter)"
              :key="c.id"
              :label="c.name"
              :value="String(c.id)"
            />
          </el-select>
          <el-button type="primary" :loading="bankLoading" @click="filterBank"
            >查询</el-button
          >
        </div>

        <el-table
          :data="filteredBankList"
          v-loading="bankLoading"
          style="width: 100%"
          @selection-change="handleBankSelection"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="type" label="题型" width="100">
            <template #default="{ row }">
              <el-tag
                :type="
                  row.type === 'judge'
                    ? ''
                    : row.type === 'select'
                      ? 'success'
                      : 'warning'
                "
              >
                {{
                  row.type === "judge"
                    ? "单选"
                    : row.type === "select"
                      ? "多选"
                      : "简答"
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="题干" min-width="320" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.titleText || htmlToPlainText(row.title) }}
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="科目" width="100">
            <template #default="{ row }">
              <span>{{ row.subjectName || getSubjectLabel(row.subject) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="默认分值" width="100" />
        </el-table>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="bankDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmImportBank"
              >导入选中 ({{ selectedBankQuestions.length }})</el-button
            >
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import RichTextEditor from "@/components/RichTextEditor.vue";
import { ElMessage } from "@/utils/element-plus";
import { createPaper, getPaperDetail, updatePaper } from "@/api/paper";
import { getQuestionList } from "@/api/question";
import { getQuestionCategoryList } from "@/api/questionCategory";
import { getClassList } from "@/api/class";
import { getSubjectList } from "@/api/subject";
import {
  buildSubjectNameMap,
  getSubjectDisplayName,
  normalizeSubjectOptions,
} from "@/utils/subject";
import { htmlToPlainText } from "@/utils/richText";

const subjectiveQuestionTypes = ["text", "fill", "application"];

const route = useRoute();
const router = useRouter();
const formRef = ref();
const pageLoading = ref(false);
const submitLoading = ref(false);
const categoryOptions = ref([]);
const classOptions = ref([]);
const subjectOptions = ref([]);
const subjectNameMap = computed(() =>
  buildSubjectNameMap(subjectOptions.value),
);
const isEdit = ref(false);
let questionSeed = 0;

const nextQuestionKey = () => `paper-question-${Date.now()}-${questionSeed++}`;

const createEmptyQuestion = (type = "judge") => ({
  __key: nextQuestionKey(),
  questionId: null,
  subject: "",
  type,
  title: "",
  score: subjectiveQuestionTypes.includes(type) ? 10 : 2,
  options: subjectiveQuestionTypes.includes(type) ? null : { A: "", B: "", C: "", D: "" },
  answer: type === "judge" ? "A" : "",
  answers: [],
  analysis: "",
});

const normalizeOptions = (options) => ({
  A: options?.A || "",
  B: options?.B || "",
  C: options?.C || "",
  D: options?.D || "",
});

const normalizeQuestion = (question = {}) => ({
  __key: nextQuestionKey(),
  questionId: question.questionId ?? question.sourceQuestionId ?? null,
  subject: question.subject || "",
  type: question.type || "judge",
  title: question.title || "",
  score: Number(question.score) || 0,
  options: subjectiveQuestionTypes.includes(question.type)
    ? null
    : normalizeOptions(question.options),
  answer:
    question.type === "select"
      ? ""
      : question.answer || (question.type === "judge" ? "A" : ""),
  answers: question.type === "select" ? [...(question.answers || [])] : [],
  analysis: question.analysis || "",
});

const form = reactive({
  id: undefined,
  paperName: "",
  subject: "",
  duration: 90,
  totalScore: 0,
  startTime: "",
  classIds: [],
  status: 0,
  questionList: [],
});

const rules = {
  paperName: [{ required: true, message: "请输入试卷名称", trigger: "blur" }],
  subject: [{ required: true, message: "请选择科目", trigger: "change" }],
  duration: [{ required: true, message: "请输入考试时长", trigger: "change" }],
};

const bankDialogVisible = ref(false);
const bankLoading = ref(false);
const bankSearch = ref("");
const bankSubjectFilter = ref("");
const bankCategoryFilter = ref("");
const filteredBankList = ref([]);
const selectedBankQuestions = ref([]);

const calcRealTotal = computed(() => {
  return form.questionList.reduce(
    (sum, question) => sum + (Number(question.score) || 0),
    0,
  );
});

const filterCategories = (subject) => {
  return categoryOptions.value.filter(
    (item) => !subject || item.subject === subject,
  );
};

const getSubjectLabel = (subject, subjectName = "") => {
  return getSubjectDisplayName(subject, subjectNameMap.value, subjectName);
};

const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    paperName: "",
    subject: "",
    duration: 90,
    totalScore: 0,
    startTime: "",
    classIds: [],
    status: 0,
    questionList: [],
  });
  formRef.value?.clearValidate();
};

const fetchSubjectOptions = async () => {
  const { data } = await getSubjectList();
  subjectOptions.value = normalizeSubjectOptions(data || []);
};

const fetchCategoryOptions = async () => {
  const { data } = await getQuestionCategoryList({ pageNum: 1, pageSize: 100 });
  categoryOptions.value = data.list || [];
};

const fetchClassOptions = async () => {
  const { data } = await getClassList({ pageNum: 1, pageSize: 200 });
  classOptions.value = data.list || [];
};

const loadPaper = async (id) => {
  pageLoading.value = true;
  try {
    const { data } = await getPaperDetail(id);
    isEdit.value = true;
    Object.assign(form, {
      id: data.id,
      paperName: data.paperName,
      subject: data.subject,
      duration: data.duration,
      totalScore: data.totalScore || 0,
      startTime: data.startTime || "",
      classIds: (data.classIds || []).map((item) => Number(item)),
      status: data.status,
      questionList: (data.questionList || []).map(normalizeQuestion),
    });
  } finally {
    pageLoading.value = false;
  }
};

const handleQuestionTypeChange = (question) => {
  if (subjectiveQuestionTypes.includes(question.type)) {
    question.options = null;
    question.answer =
      typeof question.answer === "string" ? question.answer : "";
    question.answers = [];
    return;
  }

  question.options = normalizeOptions(question.options);
  if (question.type === "judge") {
    question.answer =
      typeof question.answer === "string" && question.answer
        ? question.answer
        : "A";
    question.answers = [];
    return;
  }

  question.answer = "";
  question.answers = Array.isArray(question.answers) ? question.answers : [];
};

const addQuestion = (type) => {
  const question = createEmptyQuestion(type);
  question.subject = form.subject || "";
  form.questionList.push(question);
};

const removeQuestion = (index) => {
  form.questionList.splice(index, 1);
};

const openBankDialog = async () => {
  bankDialogVisible.value = true;
  bankSubjectFilter.value = form.subject || "";
  bankCategoryFilter.value = "";
  selectedBankQuestions.value = [];
  await filterBank();
};

const filterBank = async () => {
  bankLoading.value = true;
  try {
    const { data } = await getQuestionList({
      pageNum: 1,
      pageSize: 200,
      title: bankSearch.value || undefined,
      subject: bankSubjectFilter.value || undefined,
      categoryId: bankCategoryFilter.value || undefined,
    });
    filteredBankList.value = data.list || [];
  } finally {
    bankLoading.value = false;
  }
};

const handleBankSelection = (rows) => {
  selectedBankQuestions.value = rows;
};

const confirmImportBank = () => {
  if (selectedBankQuestions.value.length === 0) {
    ElMessage.warning("请先选择试题");
    return;
  }

  const imported = selectedBankQuestions.value.map((question) => ({
    __key: nextQuestionKey(),
    questionId: question.id,
    subject: question.subject,
    type: question.type,
    title: question.title,
    score: question.score,
    options:
      subjectiveQuestionTypes.includes(question.type)
        ? null
        : normalizeOptions(question.options),
    answer:
      question.type === "select"
        ? ""
        : question.answer || (question.type === "judge" ? "A" : ""),
    answers: question.type === "select" ? [...(question.answers || [])] : [],
    analysis: question.analysis || "",
  }));

  form.questionList.push(...imported);
  selectedBankQuestions.value = [];
  bankDialogVisible.value = false;
  ElMessage.success(`已导入 ${imported.length} 道试题`);
};

const buildQuestionPayload = (question) => {
  const payload = {
    questionId: question.questionId || undefined,
    subject: question.subject || form.subject || undefined,
    type: question.type,
    title: question.title,
    score: Number(question.score) || 0,
    options:
      subjectiveQuestionTypes.includes(question.type)
        ? null
        : normalizeOptions(question.options),
    analysis: question.analysis || "",
  };

  if (question.type === "select") {
    payload.answers = Array.isArray(question.answers) ? question.answers : [];
  } else {
    payload.answer = question.answer || "";
  }

  return payload;
};

const onSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  if (form.questionList.length === 0) {
    ElMessage.warning("请至少添加一道试题");
    return;
  }

  submitLoading.value = true;
  try {
    const payload = {
      paperName: form.paperName,
      subject: form.subject,
      duration: form.duration,
      totalScore: calcRealTotal.value,
      startTime: form.startTime || null,
      classIds: form.classIds,
      status: form.status,
      questionList: form.questionList.map(buildQuestionPayload),
    };

    if (isEdit.value && form.id) {
      await updatePaper(form.id, payload);
      ElMessage.success("更新成功");
    } else {
      await createPaper(payload);
      ElMessage.success("创建成功");
    }

    router.push("/exam/index");
  } finally {
    submitLoading.value = false;
  }
};

const handleCancel = () => {
  router.push("/exam/index");
};

onMounted(async () => {
  resetForm();
  await Promise.all([
    fetchSubjectOptions(),
    fetchCategoryOptions(),
    fetchClassOptions(),
  ]);
  if (route.params.id) {
    await loadPaper(route.params.id);
  }
});
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.section-spacing {
  margin-top: 30px;
}

.section-subtitle {
  font-size: 14px;
  color: #999;
  font-weight: normal;
  margin-left: 10px;
}

.questions-container {
  background: #fcfcfc;
  border: 1px solid #ebeef5;
  padding: 20px;
  border-radius: 8px;
  min-height: 200px;
}

.question-item {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}

.q-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #eee;
}

.q-index {
  font-weight: bold;
  margin-right: 15px;
  color: #409eff;
}

.q-type-select {
  width: 100px;
  margin-right: 10px;
}

.q-score-input {
  width: 100px;
}

.score-label {
  margin-left: 5px;
  color: #666;
  font-size: 12px;
}

.remove-btn {
  margin-left: auto;
}

.editor-block + .editor-block {
  margin-top: 16px;
}

.editor-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.options-area {
  margin-top: 16px;
}

.option-card + .option-card {
  margin-top: 16px;
}

.option-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.add-bar {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}

.submit-bar {
  margin-top: 40px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.bank-filter-item {
  width: 200px;
}
</style>
