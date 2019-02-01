module.exports = {
    parser: "babel-eslint",
    extends: "airbnb-base",
    rules: {
        "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
        "padded-blocks": ["error", { "classes": "always" }],
        "indent": 0,
        "no-mixed-operators":[
            "error",
            {
                "groups": [
                    //["+", "-", "*", "/", "%", "**"],
                    //["&", "|", "^", "~", "<<", ">>", ">>>"],
                    ["==", "!=", "===", "!==", ">", ">=", "<", "<="],
                    ["in", "instanceof"]
                ],
                "allowSamePrecedence": true
            }
        ],
        "no-underscore-dangle": ["error", { "allowAfterThis": true }],
        "max-len": ["error", { "code": 120 }],
        "spaced-comment": [0],
        "import/no-useless-path-segments": ["never"],
        "import/no-absolute-path": ["never"],
        "import/no-unresolved": ["never"],
        "object-curly-newline": "off",
        "no-param-reassign": ["error", { "props": false }],
        "no-plusplus": "off",
        "prefer-destructuring": "off",
        "arrow-body-style": "off",
    },
    "env": {
        "browser": true,
        //"node": true
    }
};
