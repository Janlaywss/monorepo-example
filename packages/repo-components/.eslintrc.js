/**
 * "off" 或 0 - 关闭规则
 * "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
 * "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
 */

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'prettier',
    'react-hooks',
    'simple-import-sort',
    // 用于支持文件及文件夹名称校验
    // "unicorn"
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    // Uncomment the following lines to enable eslint-config-prettier
    // Is not enabled right now to avoid issues with the Next.js repo
    'prettier',
  ],
  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'prettier/prettier': 'warn',
    'react/react-in-jsx-scope': 0,
    'react/display-name': 0,
    'react/prop-types': 0,
    'dot-notation': 2,
    'react/self-closing-comp': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/member-delimiter-style': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // 看下是否有需要加上
    // camelcase: 2,
    'no-console': [
      2,
      {
        allow: ['warn', 'error', 'info'],
      },
    ],
    // 变量规范
    // camelcase: [
    //   'error',
    //   {
    //     properties: 'always',
    //     ignoreDestructuring: true,
    //     // react fucn
    //     allow: ['^UNSAFE_'],
    //   },
    // ],
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': ['warn'],
      },
    },
    {
      files: ['*.ts', '*.tsx', '*.js'],
      rules: {
        // 'simple-import-sort/imports': 'off',
        // 'import/order': ['error', { 'newlines-between': 'always' }],
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // Node.js builtins. You could also generate this regex if you use a `.js` config.
              // For example: `^(${require("module").builtinModules.join("|")})(/|$)`
              [
                '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
              ],
              // Packages. `react` related packages come first.
              ['^react', '^@?\\w'],
              // Internal packages.
              ['^(components|lib|locales|@)(/.*|$)'],
              // Side effect imports.
              ['^\\u0000'],
              // Parent imports. Put `..` last.
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Other relative imports. Put same-folder imports and `.` last.
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              // Style imports.
              ['^.+\\.s?css$', '^.+\\.s?less$'],
            ],
          },
        ],
      },
    },
  ],
};
