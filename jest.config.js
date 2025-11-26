module.exports = {
  testEnvironment: "node",
  testTimeout: 20000,
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",           
    "!src/config/**",           
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
