import type { JourneyMode, SignificanceResult } from "./types";

/**
 * Extracts the domain (top-level path segment) from a path.
 * "/products/123" → "products"
 * "/" → ""
 */
export function extractDomain(path: string): string {
  const segments = path.split("/").filter(Boolean);
  return segments[0] ?? "";
}

/**
 * Mode-level significance strategy.
 * - trail: always false (never creates a new workspace)
 * - workspaces: compares domains of current vs target path
 * - route-derived: stub, returns undefined
 */
function modeStrategy(
  mode: JourneyMode,
  currentPath: string,
  targetPath: string,
  domains?: string[],
): SignificanceResult {
  switch (mode) {
    case "trail":
      return false;

    case "workspaces": {
      const currentDomain = extractDomain(currentPath);
      const targetDomain = extractDomain(targetPath);
      if (
        domains &&
        domains.length > 0 &&
        !domains.includes(targetDomain)
      ) {
        // Target domain not in the declared domain list — extend current workspace
        return false;
      }
      return currentDomain !== targetDomain;
    }

    case "route-derived":
      // Future: infer from route tree
      return undefined;
  }
}

/**
 * Resolves significance through 3 layers:
 * 1. Link-level explicit override
 * 2. Mode strategy
 * 3. Default: extend current workspace (false)
 */
export function resolveSignificance(
  linkLevel: boolean | undefined,
  mode: JourneyMode,
  currentPath: string,
  targetPath: string,
  domains?: string[],
): boolean {
  // Layer 1: explicit link-level override
  if (linkLevel !== undefined) {
    return linkLevel;
  }

  // Layer 2: mode strategy
  const modeResult = modeStrategy(mode, currentPath, targetPath, domains);
  if (modeResult !== undefined) {
    return modeResult;
  }

  // Layer 3: default — extend current workspace
  return false;
}
