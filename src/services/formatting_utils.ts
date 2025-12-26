import {
  addMilliseconds,
  addMinutes,
  addSeconds,
  format,
  fromUnixTime,
  getMonth,
  getUnixTime,
  getYear,
  intervalToDuration,
} from "date-fns";
import { csvRow, ParsedCSVRowDataIF } from "../types/types.ts";

export const isCurrentMonthAndYear = (month: string, year: string) => {
  const currentMonth = getMonth(new Date());
  const currentYear = getYear(new Date());
  return currentMonth === Number(month) && currentYear === Number(year);
};

export const isFutureMonthAndYear = (month: string, year: string) => {
  const currentMonth = getMonth(new Date());
  const currentYear = getYear(new Date());

  const cardYear = Number(year);
  const cardMonth = Number(month);

  return cardYear >= currentYear && cardMonth > currentMonth;
};

/**
 * This is used to turn seconds (as a number) into a human-readable string.
 *
 * By default, it returns a labeled string:
 * 1d 17h 21m
 * Use this for monthly/annual sums.
 *
 * Pass true to force it to use clock-like formatting.
 * "01:25:30"
 * Use this for workout-specific duration data.
 *
 * @param seconds
 * @param forceClockFormat
 */
export const getFormattedDuration = (
  seconds: number,
  forceClockFormat = false,
): string => {
  const duration = intervalToDuration({
    start: new Date(0, 0, 0, 0, 0, 0),
    end: new Date(0, 0, 0, 0, 0, seconds),
  });

  const days = duration.days;
  const hr =
    duration.hours && duration.hours < 10
      ? `${forceClockFormat ? "0" : ""}${duration.hours}`
      : duration.hours;
  const min =
    duration.minutes && duration.minutes < 10
      ? `${forceClockFormat ? "0" : ""}${duration.minutes}`
      : duration.minutes;
  const sec =
    duration.seconds && duration.seconds < 10
      ? `0${duration.seconds}`
      : duration.seconds;

  if (!hr && !min && !sec) {
    return "--";
  }

  const dys = days && !forceClockFormat ? `${days}d ` : "";
  // always default to this label style if we detect 'days'
  if (days || !forceClockFormat) {
    // use for this format: "1d 12h 37m"
    return `${dys}${hr ?? "0"}h ${min ?? "0"}m`;
  } else {
    // no days, or no label compacting: default to "01:25:00" clock format
    return `${hr ?? "00"}:${min ?? "00"}:${sec ?? "0"}`;
  }
};

export const getDayOfMonth = (item: string): number => {
  return item ? Number(format(new Date(item), "d")) : 0;
};

export const getFormattedDate = (item: string): string => {
  return item ? format(new Date(item), "M/d/yy") : "not a date";
};

export const getDateSinceEpoch = (date: string): number => {
  return date ? getUnixTime(new Date(date)) : 0;
};

export const getFormattedEpochDate = (timestamp: number) => {
  return format(new Date(fromUnixTime(timestamp)), "MM/dd/yyyy");
};

/* Return just the year for this row, ie: 2024 */
export const getRowYear = (timestamp: number): number => {
  if (!timestamp) {
    return 0;
  }
  return getYear(fromUnixTime(timestamp));
};

export const getFormattedTime = (item: string): string => {
  return item ? format(new Date(item), "hh:mm aaa") : "not a date";
};

export const getFormattedDistance = (item: string): number => {
  return item ? Number(item) : 0;
};

export const getFormattedDistanceString = (
  item: string | number | undefined,
  includeMeters = true,
): string => {
  if (!item) {
    return "--";
  }
  return `${Number(item).toLocaleString()}${includeMeters ? "m" : ""}`;
};

export const getMonthNumber = (timestamp: number) => {
  return getMonth(fromUnixTime(timestamp)) + 1;
};

// Transforms data like "2:56.5" into millisecond value
export const parseTimeToMilliseconds = (timeString: string): number => {
  const [minutesStr, secondsWithMillisecondsStr] = timeString.split(":");
  const [secondsStr, millisecondsStr] = secondsWithMillisecondsStr.split(".");

  const minutes = parseInt(minutesStr);
  const seconds = parseInt(secondsStr);
  const milliseconds = parseInt(millisecondsStr);

  const resultDate = addMinutes(
    addSeconds(addMilliseconds(new Date(0), milliseconds), seconds),
    minutes,
  );

  return resultDate.getTime();
};

// Transforms milliseconds back to pace, like "2:45"
export const formatMillisecondsToTimestamp = (
  milliseconds: number | string | undefined,
): string => {
  if (milliseconds === undefined || typeof milliseconds !== "number") {
    return "timestamp undefined";
  }
  // Create a Date object from milliseconds
  const date = new Date(milliseconds);

  // Extract minutes, seconds, and milliseconds
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const millisecondsRemaining = date.getMilliseconds();

  // Pad seconds with a leading zero if it is a single digit
  const paddedSeconds = seconds.toString().padStart(2, "0");

  // Format milliseconds with trailing zeroes
  const paddedMilliseconds = (millisecondsRemaining / 1000).toFixed(3).slice(2);

  // Format the timestamp string
  return `${minutes}:${paddedSeconds}.${paddedMilliseconds}`;
};

export const getNumberWithCommas = (input: number | string): string => {
  const number = typeof input === "number" ? input : parseFloat(input);

  if (isNaN(number)) {
    throw new Error("Input is not a valid number");
  }

  return number.toLocaleString("en-US");
};

export const getFormattedErgName = (
  erg: "row" | "bike" | "ski" | "rowErg" | "bikeErg" | "skiErg",
): string => {
  if (erg === "row" || erg === "bike" || erg === "ski") {
    return erg[0].toUpperCase() + erg.slice(1).toLowerCase() + "Erg";
  } else if (erg === "rowErg" || erg === "bikeErg" || erg === "skiErg") {
    return erg[0].toUpperCase() + erg.slice(1);
  } else {
    return erg;
  }
};

export const getFullDate = (timestamp: number) => {
  return format(fromUnixTime(timestamp), "EEEE, MMM d, yyyy");
};

export const getErgTypeFromRow = (row: csvRow) => {
  return (String(row[19]).charAt(0).toLowerCase() +
    String(row[19]).slice(1)) as "bikeErg" | "rowErg" | "skiErg";
};

export const getRowData = (row: csvRow): ParsedCSVRowDataIF => {
  return {
    date: getDateSinceEpoch(String(row[1])),
    day: getDayOfMonth(String(row[1])),
    startTime: getFormattedTime(String(row[1])),
    type: getErgTypeFromRow(row),
    description: String(row[2]),
    pace: String(row[11]), // example: 2:37.4
    watts: Number(row[12]),
    workTime: Number(row[4]), // example: 1234.5
    restTime: Number(row[6]),
    workDistance: getFormattedDistance(row[7] as string),
    restDistance: getFormattedDistance(row[8] as string),
    strokeRate: Number(row[9]),
    strokeCount: Number(row[10]),
    totalCal: `${row[14]} (${row[13]} cal/hr)`,
    avgHeartRate: Number(row[15]),
    dragFactor: Number(row[16]),
    ranked: Boolean(row[20]),
    id: String(row[0]),
  };
};
