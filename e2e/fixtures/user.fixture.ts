export function generateTestUser() {
  return {
    email: `test-${Date.now()}@example.com`,
    password: "TestPass123",
  };
}
