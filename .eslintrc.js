module.exports = {
  "env": {
    "node": true,
    "browser": true,
    "commonjs": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "globals": {
    "MAIN_WINDOW_WEBPACK_ENTRY": false,
    "MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY": false
  },
  "rules": {}
};
