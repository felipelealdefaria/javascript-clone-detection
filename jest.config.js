module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '<rootDir>/src/**/*.{spec, test}.{ts,tsx}',
    '<rootDir>/src/**/__tests__/*.{spec, test}.{ts,tsx}'
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  testEnvironment: 'jsdom',
  transform: {
    '.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '\\.scss$': 'identity-obj-proxy'
  }
}
