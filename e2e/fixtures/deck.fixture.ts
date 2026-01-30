export function generateTestDeck() {
  return {
    name: `Test Deck ${Date.now()}`,
  };
}

export function generateTestDeckWithName(name: string) {
  return {
    name: `${name} ${Date.now()}`,
  };
}
