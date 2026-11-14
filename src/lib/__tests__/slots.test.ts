import { describe, it, expect, vi, beforeEach } from "vitest";
import { istanbulToDate, addDays, dayKey } from "../time";

vi.mock("../db", () => ({
  db: {
    business: { findFirst: vi.fn() },
    workingHour: { findUnique: vi.fn() },
    appointment: { findMany: vi.fn() },
  },
}));

import { db } from "../db";
import { getSlots } from "../slots";

const BASE_DAY = "2025-06-15";
const NOW_AT_MIDNIGHT = istanbulToDate(BASE_DAY, 0); // 2025-06-14T21:00:00Z

const defaultBusiness = {
  slotIntervalMin: 30,
  minLeadMinutes: 0,
  maxAdvanceDays: 30,
};

const openWH = { openMin: 9 * 60, closeMin: 18 * 60, isClosed: false };
const closedWH = { openMin: 9 * 60, closeMin: 18 * 60, isClosed: true };

function setup(wh = openWH, business = defaultBusiness, busy: { startAt: Date; endAt: Date }[] = []) {
  vi.mocked(db.business.findFirst).mockResolvedValue(business as any);
  vi.mocked(db.workingHour.findUnique).mockResolvedValue(wh as any);
  vi.mocked(db.appointment.findMany).mockResolvedValue(busy as any);
}

beforeEach(() => vi.resetAllMocks());

describe("slot generation — open day", () => {
  it("generates correct number of slots for 30 min service, 30 min interval", async () => {
    setup();
    // 9 hours = 540 min; 540/30 = 18 slots (last slot starts at 17:30, ends 18:00)
    const slots = await getSlots(BASE_DAY, 30, NOW_AT_MIDNIGHT);
    expect(slots).toHaveLength(18);
  });

  it("first slot starts at openMin", async () => {
    setup();
    const slots = await getSlots(BASE_DAY, 30, NOW_AT_MIDNIGHT);
    expect(slots[0].time).toBe("09:00");
  });

  it("last slot ends exactly at closeMin (does not overrun)", async () => {
    setup();
    const slots = await getSlots(BASE_DAY, 30, NOW_AT_MIDNIGHT);
    expect(slots[slots.length - 1].time).toBe("17:30");
  });

  it("slots are spaced by slotIntervalMin", async () => {
    setup();
    const slots = await getSlots(BASE_DAY, 30, NOW_AT_MIDNIGHT);
    expect(slots[0].time).toBe("09:00");
    expect(slots[1].time).toBe("09:30");
    expect(slots[2].time).toBe("10:00");
  });

  it("respects longer service duration — fewer slots", async () => {
    setup();
    // 60-min service with 30-min interval: last valid start is 17:00 → 17 slots
    const slots = await getSlots(BASE_DAY, 60, NOW_AT_MIDNIGHT);
    expect(slots).toHaveLength(17);
    expect(slots[slots.length - 1].time).toBe("17:00");
  });

  it("skips slots that would overrun closeMin", async () => {
    setup();
    // 90-min service: last valid start is 16:30 (16:30 + 90 = 18:00)
    const slots = await getSlots(BASE_DAY, 90, NOW_AT_MIDNIGHT);
    expect(slots[slots.length - 1].time).toBe("16:30");
  });
});

describe("slot generation — closed weekday", () => {
  it("returns no slots", async () => {
    setup(closedWH);
    const slots = await getSlots(BASE_DAY, 30, NOW_AT_MIDNIGHT);
    expect(slots).toHaveLength(0);
  });
});

describe("no business record", () => {
  it("returns [] when business.findFirst returns null", async () => {
    vi.mocked(db.business.findFirst).mockResolvedValue(null);
    const slots = await getSlots(BASE_DAY, 30, NOW_AT_MIDNIGHT);
    expect(slots).toEqual([]);
  });
});

describe("minLeadMinutes", () => {
  it("excludes slots too soon relative to now", async () => {
    const business = { ...defaultBusiness, minLeadMinutes: 60 };
    setup(openWH, business);
    // now = 09:00 Istanbul; earliest = 10:00 Istanbul
    const nowIstanbul9am = istanbulToDate(BASE_DAY, 9 * 60);
    const slots = await getSlots(BASE_DAY, 30, nowIstanbul9am);
    expect(slots[0].time).toBe("10:00");
  });
});

describe("maxAdvanceDays", () => {
  it("returns no slots for a day beyond maxAdvanceDays", async () => {
    setup();
    const now = new Date("2025-06-15T06:00:00.000Z"); // 09:00 Istanbul
    const farFuture = addDays("2025-06-15", 31);
    const slots = await getSlots(farFuture, 30, now);
    expect(slots).toHaveLength(0);
  });

  it("returns slots for a day exactly at maxAdvanceDays", async () => {
    setup();
    const now = new Date("2025-06-15T06:00:00.000Z");
    const boundary = addDays("2025-06-15", 30);
    const slots = await getSlots(boundary, 30, now);
    expect(slots.length).toBeGreaterThan(0);
  });
});

describe("booking conflict detection", () => {
  it("skips a slot that is fully occupied", async () => {
    const busy = [{
      startAt: istanbulToDate(BASE_DAY, 9 * 60),
      endAt: istanbulToDate(BASE_DAY, 9 * 60 + 30),
    }];
    setup(openWH, defaultBusiness, busy);
    const slots = await getSlots(BASE_DAY, 30, NOW_AT_MIDNIGHT);
    expect(slots.find((s) => s.time === "09:00")).toBeUndefined();
    expect(slots.find((s) => s.time === "09:30")).toBeDefined();
  });

  it("skips a slot that partially overlaps (busy starts mid-slot)", async () => {
    // Busy 09:15–09:45 overlaps 09:00–09:30 and 09:30–10:00
    const busy = [{
      startAt: istanbulToDate(BASE_DAY, 9 * 60 + 15),
      endAt: istanbulToDate(BASE_DAY, 9 * 60 + 45),
    }];
    setup(openWH, defaultBusiness, busy);
    const slots = await getSlots(BASE_DAY, 30, NOW_AT_MIDNIGHT);
    expect(slots.find((s) => s.time === "09:00")).toBeUndefined();
    expect(slots.find((s) => s.time === "09:30")).toBeUndefined();
    expect(slots.find((s) => s.time === "10:00")).toBeDefined();
  });

  it("two overlapping appointments both conflict with the same slot", async () => {
    const busy = [
      { startAt: istanbulToDate(BASE_DAY, 9 * 60), endAt: istanbulToDate(BASE_DAY, 9 * 60 + 30) },
      { startAt: istanbulToDate(BASE_DAY, 9 * 60), endAt: istanbulToDate(BASE_DAY, 9 * 60 + 30) },
    ];
    setup(openWH, defaultBusiness, busy);
    const slots = await getSlots(BASE_DAY, 30, NOW_AT_MIDNIGHT);
    expect(slots.find((s) => s.time === "09:00")).toBeUndefined();
  });

  it("adjacent busy block does NOT block the slot (end == start boundary)", async () => {
    // Busy 08:30–09:00 — ends exactly when slot starts; should NOT block 09:00
    const busy = [{
      startAt: istanbulToDate(BASE_DAY, 8 * 60 + 30),
      endAt: istanbulToDate(BASE_DAY, 9 * 60),
    }];
    setup(openWH, defaultBusiness, busy);
    const slots = await getSlots(BASE_DAY, 30, NOW_AT_MIDNIGHT);
    expect(slots.find((s) => s.time === "09:00")).toBeDefined();
  });
});
