export const normalizeSubjectOptions = (list = []) => {
    return list
        .map((item) => ({
            label: item.subjectName || item.name || item.subjectCode || item.code || '',
            value: item.subjectCode || item.code || ''
        }))
        .filter((item) => item.value)
}

export const buildSubjectNameMap = (options = []) => {
    return options.reduce((map, item) => {
        map[item.value] = item.label
        return map
    }, {})
}

export const getSubjectDisplayName = (subject, subjectNameMap = {}, subjectName = '') => {
    return subjectName || subjectNameMap[subject] || subject || ''
}
