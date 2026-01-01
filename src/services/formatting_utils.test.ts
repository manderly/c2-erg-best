import * as formattingUtils from "./formatting_utils";
import { csvRow } from "../types/types";

describe("formatting_utils", () => {
  describe("isCurrentMonthAndYear", () => {
    // todo: mock the current date to make this work
    // it("returns true for current month/year", () => {
    //   expect(formattingUtils.isCurrentMonthAndYear("0", "2026")).toBe(true);
    // });
    it("returns false for non-current month/year", () => {
      expect(formattingUtils.isCurrentMonthAndYear("5", "2025")).toBe(false);
    });
  });

  describe("isFutureMonthAndYear", () => {
    // todo: mock future date better
    it("returns true for future month/year", () => {
      expect(formattingUtils.isFutureMonthAndYear("1", "2100")).toBe(true);
    });
    it("returns false for past month/year", () => {
      expect(formattingUtils.isFutureMonthAndYear("0", "2025")).toBe(false);
    });
  });

  describe("getFormattedDuration", () => {
    it("formats seconds to labeled string", () => {
      expect(formattingUtils.getFormattedDuration(3661)).toMatch(/1h 1m/);
    });
    it("formats seconds to clock format", () => {
      expect(formattingUtils.getFormattedDuration(3661, true)).toBe("01:01:01");
    });
    it("returns -- for zero seconds", () => {
      expect(formattingUtils.getFormattedDuration(0)).toBe("--");
    });
    it("formats days to labeled string", () => {
      expect(formattingUtils.getFormattedDuration(366100)).toMatch(/4d 5h 41m/);
    });
  });

  describe("getDayOfMonth", () => {
    it("returns correct day", () => {
      expect(formattingUtils.getDayOfMonth("2026-01-15T00:00:00Z")).toBe(14); // local time
    });
    it("returns 0 for invalid date", () => {
      expect(formattingUtils.getDayOfMonth("")).toBe(0);
    });
  });

  describe("getFormattedDate", () => {
    it("formats date string", () => {
      expect(formattingUtils.getFormattedDate("2026-01-15T00:00:00Z")).toBe(
        "1/14/26",
      ); // local time
    });
    it("returns not a date for invalid", () => {
      expect(formattingUtils.getFormattedDate("")).toBe("not a date");
    });
  });

  describe("getDateSinceEpoch", () => {
    it("returns unix time for date", () => {
      expect(
        formattingUtils.getDateSinceEpoch("2026-01-01T00:00:00Z"),
      ).toBeGreaterThan(0);
    });
    it("returns 0 for invalid date", () => {
      expect(formattingUtils.getDateSinceEpoch("")).toBe(0);
    });
  });

  describe("getFormattedEpochDate", () => {
    it("formats epoch timestamp", () => {
      const ts = formattingUtils.getDateSinceEpoch("2026-01-01T00:00:00Z");
      expect(formattingUtils.getFormattedEpochDate(ts)).toMatch(/12\/31\/2025/); // local time
    });
  });

  describe("getRowYear", () => {
    it("returns year from timestamp", () => {
      const ts = formattingUtils.getDateSinceEpoch("2026-01-01T00:00:00Z");
      expect(formattingUtils.getRowYear(ts)).toBe(2025); // local time
    });
    it("returns 0 for invalid timestamp", () => {
      expect(formattingUtils.getRowYear(0)).toBe(0);
    });
  });

  describe("getFormattedTime", () => {
    it("formats time string", () => {
      expect(formattingUtils.getFormattedTime("2026-01-01T13:45:00Z")).toMatch(
        /07:45 am/,
      ); // local time
    });
    it("returns not a date for invalid", () => {
      expect(formattingUtils.getFormattedTime("")).toBe("not a date");
    });
  });

  describe("getFormattedDistance", () => {
    it("returns number for valid string", () => {
      expect(formattingUtils.getFormattedDistance("1234")).toBe(1234);
    });
    it("returns 0 for invalid", () => {
      expect(formattingUtils.getFormattedDistance("")).toBe(0);
    });
  });

  describe("getFormattedDistanceString", () => {
    it("formats number with meters", () => {
      expect(formattingUtils.getFormattedDistanceString(1234)).toBe("1,234m");
    });
    it("formats number without meters", () => {
      expect(formattingUtils.getFormattedDistanceString(1234, false)).toBe(
        "1,234",
      );
    });
    it("returns -- for undefined", () => {
      expect(formattingUtils.getFormattedDistanceString(undefined)).toBe("--");
    });
  });

  describe("getMonthNumber", () => {
    it("returns correct month number", () => {
      const ts = formattingUtils.getDateSinceEpoch("2026-01-15T00:00:00Z");
      expect(formattingUtils.getMonthNumber(ts)).toBe(1);
    });
  });

  describe("parseTimeToMilliseconds", () => {
    it("parses time string to ms", () => {
      expect(formattingUtils.parseTimeToMilliseconds("2:56.5")).toBeGreaterThan(
        0,
      );
    });
  });

  describe("formatMillisecondsToTimestamp", () => {
    it("formats ms to timestamp", () => {
      const ms = formattingUtils.parseTimeToMilliseconds("2:45.123");
      expect(formattingUtils.formatMillisecondsToTimestamp(ms)).toMatch(/2:45/);
    });
    it("returns error for undefined", () => {
      expect(formattingUtils.formatMillisecondsToTimestamp(undefined)).toBe(
        "timestamp undefined",
      );
    });
  });

  describe("getNumberWithCommas", () => {
    it("formats number with commas", () => {
      expect(formattingUtils.getNumberWithCommas(1234567)).toBe("1,234,567");
    });
    it("throws error for invalid input", () => {
      expect(() => formattingUtils.getNumberWithCommas("abc")).toThrow();
    });
  });

  describe("getFormattedErgName", () => {
    it("formats erg names", () => {
      expect(formattingUtils.getFormattedErgName("row")).toBe("RowErg");
      expect(formattingUtils.getFormattedErgName("bikeErg")).toBe("BikeErg");
      expect(formattingUtils.getFormattedErgName("ski")).toBe("SkiErg");
    });
  });

  describe("getFullDate", () => {
    it("formats full date", () => {
      const ts = formattingUtils.getDateSinceEpoch("2026-01-01T00:00:00Z");
      expect(formattingUtils.getFullDate(ts)).toMatch(
        /Wednesday, Dec 31, 2025/,
      ); // local time
    });
  });

  describe("getErgTypeFromRow", () => {
    it("returns ergType from csvRow", () => {
      const row: csvRow = Array(21).fill("");
      row[19] = "rowErg";
      expect(formattingUtils.getErgTypeFromRow(row)).toBe("rowErg");
      row[19] = "bikeErg";
      expect(formattingUtils.getErgTypeFromRow(row)).toBe("bikeErg");
      row[19] = "skiErg";
      expect(formattingUtils.getErgTypeFromRow(row)).toBe("skiErg");
    });
  });

  describe("getRowData", () => {
    it("parses csvRow to ParsedCSVRowDataIF", () => {
      const row: csvRow = [];
      row[0] = "id123";
      row[1] = "2026-01-01T00:00:00Z";
      row[2] = "desc";
      row[4] = "1234.5";
      row[6] = "12.5";
      row[7] = "5000";
      row[8] = "0";
      row[9] = "24";
      row[10] = "300";
      row[11] = "2:37.4";
      row[12] = "200";
      row[13] = "1000";
      row[14] = "250";
      row[15] = "80";
      row[16] = "120";
      row[19] = "rowErg";
      row[20] = "true";
      const parsed = formattingUtils.getRowData(row);
      expect(parsed.id).toBe("id123");
      expect(parsed.type).toBe("rowErg");
      expect(parsed.workDistance).toBe(5000);
      expect(parsed.strokeRate).toBe(24);
      expect(parsed.totalCal).toMatch(/250/);
      expect(parsed.ranked).toBe(true);
    });
  });
});
