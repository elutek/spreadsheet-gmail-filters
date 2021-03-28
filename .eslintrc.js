module.exports = {
    "extends": "google",
    "parserOptions": {
        "ecmaVersion": 6,
    },
    "env": {
        "node": true,
    },
    "rules": {
        "comma-dangle": ["error", "never"],
        "max-len": ["error", {"code": 140}],
        "camelcase": "off",
        "async-await/space-after-async": 2,
        "async-await/space-after-await": 2,
        "eqeqeq": 2,
        "guard-for-in": "off",
        "no-var": "off",
        "no-unused-vars": "off",
        "require-jsdoc": "off",
        "new-cap": "off"
    },
    "plugins": ["async-await"]
};
