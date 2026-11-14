import { describe, it, expect } from "vitest";
import {
  istanbulToDate,
  dayKey,
  addDays,
  weekdayOf,
  minutesOfDay,
  fmtMinutes,
  parseHHMM,
  fmtTime,
  addMinutes,
} from "../time";

describe("fmtMinutes", () => {
  it("formats midnight", () => expect(fmtMinutes(0)).toBe("00:00"));
  it("formats noon", () => expect(fmtMinutes(720)).toBe("12:00"));
  it("formats 09:30", () => expect(fmtMinutes(570)).toBe("09:30"));
  it("formats 23:59", () => expect(fmtMinutes(1439)).toBe("23:59"));
});

describe("parseHHMM", () => {
  it("parses 09:00", () => expect(parseHHMM("09:00")).toBe(540));
  it("parses 00:00", () => expect(parseHHMM("00:00")).toBe(0));
  it("parses 24:00", () => expect(parseHHMM("24:00")).toBe(1440));
  it("returns null for invalid", () => expect(parseHHMM("25:00")).toBeNull());
  it("returns null for garbage", () => expect(parseHHMM("abc")).toBeNull());
  it("returns null for missing colon", () => expect(parseHHMM("0900")).toBeNull());
});

describe("addDays", () => {
  it("adds 1 day", () => expect(addDays("2025-01-31", 1)).toBe("2025-02-01"));
  it("adds 0 days", () => expect(addDays("2025-03-15", 0)).toBe("2025-03-15"));
  it("adds 30 days", () => expect(addDays("2025-01-01", 30)).toBe("2025-01-31"));
});

describe("weekdayOf", () => {
  // 2025-01-06 is a Monday (1)
  it("Monday = 1", () => expect(weekdayOf("2025-01-06")).toBe(1));
  // 2025-01-05 is a Sunday (0)
  it("Sunday = 0", () => expect(weekdayOf("2025-01-05")).toBe(0));
  // 2025-01-11 is a Saturday (6)
  it("Saturday = 6", () => expect(weekdayOf("2025-01-11")).toBe(6));
});

describe("istanbulToDate / dayKey round-trip", () => {
  it("dayKey of istanbul midnight gives back the same day", () => {
    const date = istanbulToDate("2025-06-15", 0);
    expect(dayKey(date)).toBe("2025-06-15");
  });

  it("istanbulToDate with 60 minutes is 01:00 Istanbul time", () => {
    const date = istanbulToDate("2025-06-15", 60);
    // UTC+3, so 01:00 Istanbul = 22:00 UTC previous day
    expect(date.toISOString()).toBe("2025-06-14T22:00:00.000Z");
  });
});

describe("minutesOfDay", () => {
  it("returns 0 for Istanbul midnight", () => {
    const date = istanbulToDate("2025-06-15", 0);
    expect(minutesOfDay(date)).toBe(0);
  });

  it("returns 570 for 09:30 Istanbul", () => {
    const date = istanbulToDate("2025-06-15", 570);
    expect(minutesOfDay(date)).toBe(570);
  });
});

describe("addMinutes", () => {
  it("adds minutes correctly", () => {
    const base = new Date("2025-01-01T00:00:00.000Z");
    const result = addMinutes(base, 90);
    expect(result.getTime()).toBe(base.getTime() + 90 * 60 * 1000);
  });
});

describe("fmtTime", () => {
  it("formats a date to its Istanbul HH:mm", () => {
    const date = istanbulToDate("2025-06-15", 570); // 09:30 Istanbul
    expect(fmtTime(date)).toBe("09:30");
  });
});
