import config from 'aberlaas/configs/eslint';

export default [
  ...config,
  {
    ignores: ['data/**/*.json'],
  },
];
