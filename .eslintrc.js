module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // 临时禁用 any 类型检查，后续可以逐步修复
    '@typescript-eslint/no-explicit-any': 'off',
    // 临时禁用未使用的变量警告
    '@typescript-eslint/no-unused-vars': 'warn',
    // React Hooks 依赖项警告降级为 warning
    'react-hooks/exhaustive-deps': 'warn',
    // 允许空接口
    '@typescript-eslint/no-empty-interface': 'off'
  }
} 