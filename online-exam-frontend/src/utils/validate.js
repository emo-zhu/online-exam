/**
 * 判断是否为外部链接
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
    return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 校验手机号
 * @param {string} str
 * @returns {Boolean}
 */
export function validMobile(str) {
    const reg = /^1[3-9]\d{9}$/
    return reg.test(str)
}
