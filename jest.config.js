/**   @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  setupFiles: ['<rootDir>/jest/globals.js'],
  moduleNameMapper: {},
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.ts',
    '!**/node_modules/**',
    '!**/main.ts*',
    '!**/module.ts*',
    '!**/mock/**',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/*.mappings.ts',
    '!**/*.constant.ts',
  ],
  coveragePathIgnorePatterns: ['/mocks/'],
  testPathIgnorePatterns: ['/mocks/'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      lines: 100,
      statements: 100,
    },
  },
};
