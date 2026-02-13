const { foremanLocation, foremanRelativePath } = require('@theforeman/find-foreman')
const foremanReactRelative = 'webpack/assets/javascripts/react_app';
const foremanReactFull = foremanRelativePath(foremanReactRelative);

// Jest configuration
module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: [
    'webpack/**/*.tsx',
  ],
  coverageReporters: ["clover", "json", "lcov", "text", "cobertura"],
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  setupFiles: [
    './webpack/test_setup.js',
  ],
  setupFilesAfterEnv: [
    // './webpack/global_test_setup.js',
    '@testing-library/jest-dom'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@patternfly)',
  ],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/foreman/',
    '<rootDir>/.+fixtures.+',
    '<rootDir>/engines',
  ],
  moduleDirectories: [
    'node_modules',
    'webpack/test-utils',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/foreman/',
  ],
  moduleNameMapper: {
    '^.+\\.(css|scss)$': 'identity-obj-proxy',
    '^foremanReact(.*)$': `${foremanReactFull}/$1`,
  },
};
