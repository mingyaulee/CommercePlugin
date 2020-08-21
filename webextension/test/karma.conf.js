module.exports = function (config) {
    config.set({
        singleRun: false,
        basePath: '',
        files: ['foundation/**/*.spec.js'],
        preprocessors: {
            'foundation/**/*.spec.js': ['browserify']
        },
        frameworks: ['browserify', 'source-map-support', 'jasmine'],
        browserify: {
            transform: [
                [
                    "babelify",
                    {
                        "presets": [
                            [
                                "@babel/preset-env", {
                                    "targets": {
                                        "node": "current"
                                    }
                                }
                            ]
                        ],
                        "plugins": [
                            "@babel/plugin-proposal-class-properties",
                            "@babel/plugin-proposal-optional-chaining",
                            "@babel/plugin-proposal-nullish-coalescing-operator"
                        ]
                    }
                ]
            ],
            debug: true
        },
        logLevel: config.LOG_ERROR, //config.LOG_DEBUG,
        reporters: ['progress', 'html'],
        htmlReporter: {
            outputDir: 'report',
            focusOnFailures: true,
            reportName: 'html'
        },
        browsers: ["ChromeHeadless"]
    });
};