import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

const abbreviatedNames = [
  'e',
  'err',
  'cb',
  'req',
  'res',
  'ctx',
  'idx',
  'i',
  'tmp',
  'val',
  'obj',
  'arr',
  'fn',
  'msg',
  'cfg',
]

const allowedAbbreviations = ['db', 'id', 'ids', 'src']

const barrelGroupComment = /^ @(domain|modules|infra)\/[\w-]+(\/[\w-]+)*$/

const noComments = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: { comment: 'Comments are not allowed.' },
  },
  create(context) {
    const isBarrel = /\/src\/(index|nosql)\.ts$/.test(context.filename.replaceAll('\\', '/'))
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (comment.type === 'Shebang') continue
          if (isBarrel && comment.type === 'Line' && barrelGroupComment.test(comment.value)) continue
          context.report({ loc: comment.loc, messageId: 'comment' })
        }
      },
    }
  },
}

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'data/**',
      '.claude/**',
      'examples/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mjs}'],
    plugins: { local: { rules: { 'no-comments': noComments } } },
    rules: {
      'local/no-comments': 'error',
      'id-length': ['error', { min: 2, exceptions: ['_'] }],
      'id-denylist': [
        'error',
        ...abbreviatedNames.filter((name) => !allowedAbbreviations.includes(name)),
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['packages/domain/base/**/*.ts', 'packages/modules/utils/**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    files: ['packages/infra/websites/web/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
)
