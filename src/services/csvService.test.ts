import { buildEmptyMonth, getSessionData } from "./csvService";
import { ParsedCSVRowDataIF } from "../types/types";

describe("csvService", () => {
  describe("buildEmptyMonth", () => {
    it("should return a month object with correct defaults and year as number", () => {
      const result = buildEmptyMonth("January", "2025");
      expect(result.name).toBe("January");
      expect(result.year).toBe(2025);
      expect(result.rowErg).toBeDefined();
      expect(result.bikeErg).toBeDefined();
      expect(result.skiErg).toBeDefined();
      expect(result.metersAll).toBe(0);
      expect(Array.isArray(result.rowErgSessionsByDayOfMonth)).toBe(true);
      expect(result.rowErgSessionsByDayOfMonth.length).toBe(32);
    });
  });

  describe("getSessionData", () => {
    it("should extract session data from a parsed CSV row", () => {
      const row: ParsedCSVRowDataIF = {
        date: 1672531200000,
        type: "rowErg",
        workDistance: 5000,
        workTime: 1200,
        restDistance: 0,
        restTime: 0,
        pace: "2:24.0",
        strokeRate: 24,
        watts: 200,
        day: 1,
        id: "workout123",
        startTime: "1672531200000",
        description: "Test workout",
        strokeCount: 300,
        totalCal: "250",
        dragFactor: 120,
        avgHeartRate: 80,
        ranked: false,
      };
      const session = getSessionData(row);
      expect(session.date).toBe(row.date);
      expect(session.ergType).toBe(row.type);
      expect(session.distance).toBe(row.workDistance);
      expect(session.time).toBe(String(row.workTime));
    });
  });
});
