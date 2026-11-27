// Runs before every integration test file (jest.config.js, setupFiles).
// CI sets JWT_SECRET itself. Locally the tests still run if .env has no JWT_SECRET yet.
// This value is for tests only and never used by the running API.
process.env.JWT_SECRET ??= 'integration-tests-only-secret';
