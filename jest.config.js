module.exports = {
  testURL: 'http://localhost/',
  testMatch: ['**/?*.(spec|test|e2e).(j|t)s?(x)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/templates/',
    '/lib/',
  ],
  modulePathIgnorePatterns: [
    '/templates/',
  ],
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
};
