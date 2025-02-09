import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: [
      // 默认的测试文件模式
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // 添加额外的测试文件模式（如果需要）
      '**/test/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
  },
}) 