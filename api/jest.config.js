/** Jest config: TypeScript tests via ts-jest. Tests live in test/ and end in .test.ts. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  setupFiles: ['reflect-metadata'],
};
