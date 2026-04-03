<template>
    <div class="rich-text-editor" :style="wrapperStyle">
        <Toolbar class="rich-text-toolbar" :editor="editorRef" :defaultConfig="toolbarConfig" mode="default" />
        <Editor
            v-model="valueHtml"
            class="rich-text-body"
            :defaultConfig="editorConfig"
            mode="default"
            @onCreated="handleCreated"
        />
        <div v-if="showTip" class="editor-tip">支持富文本、图片和 LaTeX 公式，公式可直接输入 $...$ 或 $$...$$。</div>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import { ElMessage } from '@/utils/element-plus'
import { uploadQuestionContentImage } from '@/api/question'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: '请输入内容'
    },
    minHeight: {
        type: Number,
        default: 220
    },
    showTip: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = shallowRef(null)
const valueHtml = ref(props.modelValue || '')

watch(() => props.modelValue, (value) => {
    const nextValue = value || ''
    if (nextValue !== valueHtml.value) {
        valueHtml.value = nextValue
    }
})

watch(valueHtml, (value) => {
    emit('update:modelValue', value || '')
})

const toolbarConfig = {
    toolbarKeys: [
        'headerSelect',
        'bold',
        'italic',
        'underline',
        'through',
        'color',
        'bgColor',
        '|',
        'bulletedList',
        'numberedList',
        'blockquote',
        '|',
        'insertLink',
        'uploadImage',
        'insertCodeBlock',
        'undo',
        'redo'
    ]
}

const editorConfig = {
    placeholder: props.placeholder,
    MENU_CONF: {
        uploadImage: {
            async customUpload(file, insertFn) {
                try {
                    const { data } = await uploadQuestionContentImage(file)
                    insertFn(data.url, data.originalName || '题目图片', data.url)
                } catch (error) {
                    ElMessage.error(error?.message || '图片上传失败')
                }
            }
        }
    }
}

const wrapperStyle = computed(() => ({
    '--editor-min-height': `${props.minHeight}px`
}))

const handleCreated = (editor) => {
    editorRef.value = editor
}

onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor) {
        editor.destroy()
    }
})
</script>

<style scoped lang="scss">
.rich-text-editor {
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    overflow: hidden;
    background: #fff;
}

.rich-text-toolbar {
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.rich-text-body {
    :deep(.w-e-text-container) {
        min-height: var(--editor-min-height);
    }

    :deep(.w-e-scroll) {
        min-height: var(--editor-min-height);
    }

    :deep(.w-e-text-placeholder) {
        top: 14px;
    }
}

.editor-tip {
    padding: 10px 12px;
    font-size: 12px;
    color: #909399;
    border-top: 1px dashed var(--el-border-color-lighter);
    background: #fafafa;
}
</style>
