import {
  addMilliseconds,
  addMinutes,
  addSeconds,
  format,
  getMonth,
  getYear,
  intervalToDuration,
} from "date-fns";

export const isCurrentMonth = (month: string) => {
  const currentMonth = getMonth(new Date()) + 1;
  return currentMonth === Number(month);
};

/**
 * This is used to turn seconds (as a number) into a human-readable string.
 * By default, it returns a clock-like formatting:
 * "01:25:30"
 * You read it as: 1 hours, 25 mins, 30 seconds
 * Use this for workout-specific duration data.
 *
 * Alternatively, pass true as the second parameter to get something meant for longer durations:
 * 17 hours, 21 minutes
 * Use this for bigger sums, like how long you spent on the machines this month or year.
 *
 * @param seconds
 * @param bigDuration
 */
export const getFormattedDuration = (
  seconds: number,
  bigDuration = false,
): string => {
  const duration = intervalToDuration({
    start: new Date(0, 0, 0, 0, 0, 0),
    end: new Date(0, 0, 0, 0, 0, seconds),
  });

  const days = duration.days;
  const hr =
    duration.hours && duration.hours < 10
      ? `0${duration.hours}`
      : duration.hours;
  const min =
    duration.minutes && duration.minutes < 10
      ? `0${duration.minutes}`
      : duration.minutes;
  const sec =
    duration.seconds && duration.seconds < 10
      ? `0${duration.seconds}`
      : duration.seconds;

  if (!hr && !min && !sec) {
    return "--";
  }

  if (bigDuration) {
    // Use this for format "12 hours, 37 minutes"
    const dys = days ? `${days} days,` : "";
    return `${dys} ${hr ?? "0"} hours, ${min ?? "0"} minutes`;
  } else {
    // use this for format "01:25:00" format
    return `${hr ?? "00"}:${min ?? "00"}:${sec ?? "00"}`;
  }
};

export const getDayOfMonth = (item: string): number => {
  return item ? Number(format(new Date(item), "d")) : 0;
};

export const getFormattedDate = (item: string): string => {
  return item ? format(new Date(item), "M/d/yy") : "not a date";
};

export const getRowYear = (rowDate: string): number => {
  if (!rowDate) {
    return 0;
  }
  return getYear(rowDate);
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

export const getMonthNumber = (item: string) => {
  return getMonth(new Date(item)) + 1;
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

export const getFullDate = (input: string) => {
  return format(new Date(input), "EEEE, MMM d, yyyy");
};
