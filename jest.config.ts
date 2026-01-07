import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^strict-store$': '<rootDir>/src/index.module.ts',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@core/(.*)$': '<rootDir>/src/modules/core/$1',
    '^@strict-store/(.*)$': '<rootDir>/src/modules/strict-store/$1',
    '^@strict-json/(.*)$': '<rootDir>/src/modules/strict-json/$1',
  },
  testPathIgnorePatterns: ['/node_modules/'],
};

export default config;
