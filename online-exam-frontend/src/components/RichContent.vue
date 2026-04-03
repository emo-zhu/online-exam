<template>
    <div ref="rootRef" class="rich-content" v-html="safeHtml"></div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import renderMathInElement from 'katex/contrib/auto-render'
import 'katex/dist/katex.min.css'
import { sanitizeRichText } from '@/utils/richText'

const props = defineProps({
    html: {
        type: String,
        default: ''
    }
})

const rootRef = ref(null)
const safeHtml = computed(() => sanitizeRichText(props.html || ''))

const renderFormula = async () => {
    await nextTick()
    if (!rootRef.value) {
        return
    }

    renderMathInElement(rootRef.value, {
        delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
        ],
        throwOnError: false,
        errorCallback: () => {}
    })
}

watch(safeHtml, () => {
    renderFormula()
}, { flush: 'post' })

onMounted(() => {
    renderFormula()
})
</script>

<style scoped lang="scss">
.rich-content {
    line-height: 1.7;
    color: #303133;
    word-break: break-word;
    overflow-wrap: anywhere;

    :deep(> :first-child) {
        margin-top: 0;
    }

    :deep(> :last-child) {
        margin-bottom: 0;
    }

    :deep(p) {
        margin: 0 0 10px;
    }

    :deep(p:last-child) {
        margin-bottom: 0;
    }

    :deep(ul),
    :deep(ol),
    :deep(blockquote),
    :deep(pre),
    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6),
    :deep(div) {
        margin-top: 0;
        margin-bottom: 10px;
    }

    :deep(ul:last-child),
    :deep(ol:last-child),
    :deep(blockquote:last-child),
    :deep(pre:last-child),
    :deep(h1:last-child),
    :deep(h2:last-child),
    :deep(h3:last-child),
    :deep(h4:last-child),
    :deep(h5:last-child),
    :deep(h6:last-child),
    :deep(div:last-child) {
        margin-bottom: 0;
    }

    :deep(img) {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        vertical-align: middle;
    }

    :deep(pre) {
        padding: 12px;
        background: #f5f7fa;
        border-radius: 6px;
        overflow-x: auto;
    }

    :deep(code) {
        font-family: Menlo, Monaco, Consolas, monospace;
    }

    :deep(.katex-display) {
        overflow-x: auto;
        overflow-y: hidden;
        margin: 0.5em 0;
    }
}
</style>
