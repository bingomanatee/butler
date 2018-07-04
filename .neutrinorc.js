module.exports = {
  use: [
    ['@neutrinojs/airbnb-base',
      {
        eslint: {
          "rules": {
            // "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
            "import/extensions": 0,
            "react/prop-types": "off",
            "no-underscore-dangle": "off",
            'no-param-reassign': 'off',
            'class-methods-use-this': 'off',
            "no-console": "off",
            'no-plusplus': 'off',
            'no-unused-vars': 'warn',
            'prefer-destructuring': 'warn',
          }
        }
      }],
    '@neutrinojs/node',
    '@neutrinojs/jest'
  ]
};
