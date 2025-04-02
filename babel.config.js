module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@": "./",
                    },
                },
            ],
            "@babel/plugin-transform-runtime",
            "@babel/plugin-proposal-export-namespace-from",
            "react-native-reanimated/plugin",
        ],
    };
};