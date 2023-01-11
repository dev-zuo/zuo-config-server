module.exports = {
  env: {
    node: true,
    es2021: true
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module'
  },
  rules: {
    'prettier/prettier': 'error'
  }
};
