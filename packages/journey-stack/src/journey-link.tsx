import { useCallback, type ReactNode } from "react";
import { useJourneyNavigate } from "./hooks";

export type JourneyLinkRenderProps = {
  navigate: () => void;
};

export type JourneyLinkProps = {
  to: string;
  label: string;
  significant?: boolean;
  children: ReactNode | ((props: JourneyLinkRenderProps) => ReactNode);
};

/**
 * JourneyLink — headless navigation component.
 *
 * Renderless mode (children as function):
 *   <JourneyLink to="/products" label="Products">
 *     {({ navigate }) => <button onClick={navigate}>Go</button>}
 *   </JourneyLink>
 *
 * Wrapping mode (children as elements):
 *   <JourneyLink to="/products" label="Products">
 *     <span>Products</span>
 *   </JourneyLink>
 *   Renders a <span> wrapper that calls navigate on click.
 */
export function JourneyLink({
  to,
  label,
  significant,
  children,
}: JourneyLinkProps) {
  const { navigate } = useJourneyNavigate();

  const handleNavigate = useCallback(
    () => navigate(to, label, significant !== undefined ? { significant } : undefined),
    [navigate, to, label, significant],
  );

  // Renderless: children as function
  if (typeof children === "function") {
    return <>{children({ navigate: handleNavigate })}</>;
  }

  // Wrapping: wrap children in a clickable span
  return (
    <span
      role="link"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNavigate();
        }
      }}
    >
      {children}
    </span>
  );
}
