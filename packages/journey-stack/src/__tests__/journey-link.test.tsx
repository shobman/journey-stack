import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { JourneyProvider } from "../provider";
import { JourneyLink } from "../journey-link";
import { useActiveChapter } from "../hooks";

function Wrapper({ children }: { children: ReactNode }) {
  return <JourneyProvider mode="trail">{children}</JourneyProvider>;
}

describe("JourneyLink", () => {
  it("renders children as function (renderless)", () => {
    render(
      <Wrapper>
        <JourneyLink to="/test" label="Test">
          {({ navigate }) => (
            <button onClick={navigate} data-testid="btn">
              Go
            </button>
          )}
        </JourneyLink>
      </Wrapper>,
    );

    expect(screen.getByTestId("btn")).toBeInTheDocument();
  });

  it("renders wrapping children with click handler", () => {
    render(
      <Wrapper>
        <JourneyLink to="/test" label="Test">
          <span data-testid="child">Click me</span>
        </JourneyLink>
      </Wrapper>,
    );

    const wrapper = screen.getByRole("link");
    expect(wrapper).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("navigates on click (renderless)", async () => {
    function TestComponent() {
      const chapter = useActiveChapter();
      return (
        <div>
          <JourneyLink to="/destination" label="Destination">
            {({ navigate }) => (
              <button onClick={navigate} data-testid="nav-btn">
                Go
              </button>
            )}
          </JourneyLink>
          <span data-testid="step-count">{chapter?.steps.length ?? 0}</span>
        </div>
      );
    }

    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>,
    );

    expect(screen.getByTestId("step-count").textContent).toBe("1");

    await userEvent.click(screen.getByTestId("nav-btn"));

    expect(screen.getByTestId("step-count").textContent).toBe("2");
  });

  it("navigates on click (wrapping)", async () => {
    function TestComponent() {
      const chapter = useActiveChapter();
      return (
        <div>
          <JourneyLink to="/dest" label="Dest">
            <span>Go</span>
          </JourneyLink>
          <span data-testid="step-count">{chapter?.steps.length ?? 0}</span>
        </div>
      );
    }

    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>,
    );

    expect(screen.getByTestId("step-count").textContent).toBe("1");

    await userEvent.click(screen.getByRole("link"));

    expect(screen.getByTestId("step-count").textContent).toBe("2");
  });
});
