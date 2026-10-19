import { describe, expect, it } from "vitest";
import { MANUAL_PAUSE_MS, nextService, SLIDE_MS } from "./data";

describe("hero autoplay rules", () => {
  it("shows each environment for about 4 seconds", () => expect(SLIDE_MS).toBe(4000));
  it("pauses autoplay for about 8 seconds after manual input", () => expect(MANUAL_PAUSE_MS).toBe(8000));
  it("cycles Events → Merchandise → Auto Care → Events", () => {
    expect(nextService("events")).toBe("merch");
    expect(nextService("merch")).toBe("auto");
    expect(nextService("auto")).toBe("events");
  });
});
