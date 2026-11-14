import { describe, it, expect } from "vitest";
import { normalizePhone, displayPhone } from "../phone";

describe("normalizePhone", () => {
  it("accepts canonical 10-digit form starting with 5", () => {
    expect(normalizePhone("5321234567")).toBe("5321234567");
  });

  it("strips +90 prefix (12 digits total)", () => {
    expect(normalizePhone("+905321234567")).toBe("5321234567");
  });

  it("strips 90 prefix without plus", () => {
    expect(normalizePhone("905321234567")).toBe("5321234567");
  });

  it("strips leading 0 (11-digit Turkish format)", () => {
    expect(normalizePhone("05321234567")).toBe("5321234567");
  });

  it("strips spaces", () => {
    expect(normalizePhone("0532 123 45 67")).toBe("5321234567");
  });

  it("strips dashes", () => {
    expect(normalizePhone("0532-123-45-67")).toBe("5321234567");
  });

  it("+90 with spaces", () => {
    expect(normalizePhone("+90 532 123 45 67")).toBe("5321234567");
  });

  it("returns null for landline-style (not starting with 5)", () => {
    expect(normalizePhone("02121234567")).toBeNull();
  });

  it("returns null for too short", () => {
    expect(normalizePhone("532123")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(normalizePhone("")).toBeNull();
  });

  it("returns null for letters", () => {
    expect(normalizePhone("abcdefghij")).toBeNull();
  });
});

describe("displayPhone", () => {
  it("formats 10-digit canonical to readable form", () => {
    expect(displayPhone("5321234567")).toBe("0532 123 45 67");
  });

  it("returns non-10-digit input unchanged", () => {
    expect(displayPhone("12345")).toBe("12345");
  });
});
