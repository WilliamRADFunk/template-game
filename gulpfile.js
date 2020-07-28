require("babel-register")({
    presets: ["env"],
    // plugins: [
    //     "@babel/plugin-proposal-nullish-coalescing-operator",
    //     "@babel/plugin-proposal-optional-chaining"
    // ]
});
require("./gulpfile.babel.js");