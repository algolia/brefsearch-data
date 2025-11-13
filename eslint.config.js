import config from 'aberlaas/configs/eslint';

export default [
  ...config,
  {
    ignores: ['data/**/*.json'],
  },
  {
    rules: {
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-param-type': 'off',
    },
  },
];
