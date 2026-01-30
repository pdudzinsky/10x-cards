export function generateTestCard(index: number = 1) {
  return {
    front: `Pytanie ${index}`,
    back: `Odpowiedź ${index}`,
  };
}

export function generateTestCardWithText(front: string, back: string) {
  return {
    front,
    back,
  };
}

export function generateLongTextCard() {
  const longBack = "A".repeat(450); // Close to 500 char limit
  return {
    front: "Pytanie z długim tekstem",
    back: `Odpowiedź z bardzo długim tekstem: ${longBack}`,
  };
}

export function generateTooLongCard() {
  return {
    front: "A".repeat(201), // Over 200 char limit
    back: "B".repeat(501), // Over 500 char limit
  };
}
