import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils/test-utils";

// Example component for demonstration
function ExampleComponent({ text }: { text: string }) {
  return <div role="heading">{text}</div>;
}

describe("ExampleComponent", () => {
  it("renders the provided text", () => {
    // Arrange
    const testText = "Hello, Testing!";

    // Act
    render(<ExampleComponent text={testText} />);

    // Assert
    expect(screen.getByRole("heading")).toHaveTextContent(testText);
  });

  it("is accessible", () => {
    // Arrange & Act
    render(<ExampleComponent text="Accessible content" />);

    // Assert
    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
  });
});
