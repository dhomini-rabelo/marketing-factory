import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/domain/competitor-analysis',
      'packages/domain/projects',
      'packages/infra/db',
      'packages/infra/http',
      'packages/infra/websites/web',
    ],
  },
})
