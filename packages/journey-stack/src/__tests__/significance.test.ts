import { describe, expect, it } from "vitest";
import { extractDomain, resolveSignificance } from "../significance";

describe("extractDomain", () => {
  it("extracts first path segment", () => {
    expect(extractDomain("/products/123")).toBe("products");
    expect(extractDomain("/settings")).toBe("settings");
  });

  it("returns empty string for root path", () => {
    expect(extractDomain("/")).toBe("");
  });

  it("handles paths without leading slash", () => {
    expect(extractDomain("products/123")).toBe("products");
  });
});

describe("resolveSignificance", () => {
  describe("layer 1: link-level override", () => {
    it("returns true when explicitly significant", () => {
      expect(resolveSignificance(true, "workspaces", "/a", "/a/1", ["a"])).toBe(
        true,
      );
    });

    it("returns false when explicitly not significant", () => {
      expect(
        resolveSignificance(false, "workspaces", "/a", "/b", ["a", "b"]),
      ).toBe(false);
    });
  });

  describe("layer 2: mode strategy", () => {
    describe("trail mode", () => {
      it("always returns false (never creates workspaces)", () => {
        expect(
          resolveSignificance(undefined, "trail", "/a", "/b"),
        ).toBe(false);
        expect(
          resolveSignificance(undefined, "trail", "/products", "/settings"),
        ).toBe(false);
      });
    });

    describe("workspaces mode", () => {
      it("returns true when domain changes", () => {
        expect(
          resolveSignificance(undefined, "workspaces", "/products/1", "/settings", [
            "products",
            "settings",
          ]),
        ).toBe(true);
      });

      it("returns false when same domain", () => {
        expect(
          resolveSignificance(
            undefined,
            "workspaces",
            "/products/1",
            "/products/2",
            ["products"],
          ),
        ).toBe(false);
      });

      it("returns false when target domain is not in domain list", () => {
        expect(
          resolveSignificance(
            undefined,
            "workspaces",
            "/products/1",
            "/unknown/page",
            ["products", "settings"],
          ),
        ).toBe(false);
      });
    });

    describe("route-derived mode (stub)", () => {
      it("falls through to default (false)", () => {
        expect(
          resolveSignificance(undefined, "route-derived", "/a", "/b"),
        ).toBe(false);
      });
    });
  });

  describe("layer 3: default", () => {
    it("defaults to false (extend current workspace)", () => {
      expect(
        resolveSignificance(undefined, "route-derived", "/a", "/b"),
      ).toBe(false);
    });
  });
});
