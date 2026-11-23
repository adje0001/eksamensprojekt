/**
 * Jest config with two projects:
 * - unit:        src/**\/*.spec.ts                One class at a time, dependencies mocked. No HTTP, no DB.
 * - integration: test/**\/*.integration.spec.ts   A Nest app over HTTP with Supertest.
 * `npm test` runs both. `npm run test:unit` or `npm run test:integration` runs one.
 *
 * The project is ESM ("type": "module"), so ts-jest runs in ESM mode and npm test starts
 * Node with --experimental-vm-modules. Imports end in .js (ESM rule); the mapper strips it.
 * End-to-end tests through the clients (Playwright/Maestro) live outside api/.
 */
const shared = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  transform: { '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.json' }] },
  setupFiles: ['reflect-metadata'],
};

export default {
  projects: [
    { ...shared, displayName: 'unit', roots: ['<rootDir>/src'], testMatch: ['**/*.spec.ts'] },
    {
      ...shared,
      displayName: 'integration',
      roots: ['<rootDir>/test'],
      testMatch: ['**/*.integration.spec.ts'],
    },
  ],
};
