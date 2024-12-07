import {addMilliseconds, addMinutes, addSeconds, format, getMonth, getYear, intervalToDuration} from "date-fns";

export const isCurrentMonth = (month: string) => {
  const currentMonth = getMonth(new Date()) + 1;
  return currentMonth === Number(month);
}

export const getFormattedDuration = (seconds: number): string => {
  const duration = intervalToDuration({
    start: new Date(0, 0, 0, 0, 0, 0),
    end: new Date(0,0,0,0,0, seconds)
  })
  const hr = duration.hours && duration.hours < 10 ? `0${duration.hours}` : duration.hours;
  const min = duration.minutes && duration.minutes < 10 ? `0${duration.minutes}` : duration.minutes;
  const sec = duration.seconds && duration.seconds < 10 ? `0${duration.seconds}` : duration.seconds;

  if (!hr && !min && !sec ) {
    return '--';
  }
  return `${hr ?? '00'}:${min ?? '00'}:${sec ?? '00'}`
}

export const getDayOfMonth = (item: string): number => {
  return item ? Number(format(new Date(item), "d")) : 0;
}

export const getFormattedDate = (item: string): string => {
  return item ? format(new Date(item), "M/d/yy") : 'not a date';
}

export const getRowYear = (rowDate: string): number => {
  if (!rowDate) {
    return 0;
  }
  return getYear(rowDate);
}

export const getFormattedTime = (item: string): string => {
  return item ? format(new Date(item), "hh:mm aaa") : 'not a date';
}

export const getFormattedDistance = (item: string): number => {
  return item ? Number(item) : 0;
}

export const getFormattedDistanceString = (item: string | number | undefined, includeMeters = true): string => {
  if (!item) {
    return '--';
  }
  return `${Number(item).toLocaleString()}${includeMeters ? 'm' : ''}`;
}

export const getMonthNumber = (item: string) => {
  return getMonth(new Date(item)) + 1;
}

// Transforms data like "2:56.5" into millisecond value
export const parseTimeToMilliseconds = (timeString: string): number => {
  const [minutesStr, secondsWithMillisecondsStr] = timeString.split(':');
  const [secondsStr, millisecondsStr] = secondsWithMillisecondsStr.split('.');

  const minutes = parseInt(minutesStr);
  const seconds = parseInt(secondsStr);
  const milliseconds = parseInt(millisecondsStr);

  const resultDate = addMinutes(addSeconds(addMilliseconds(new Date(0), milliseconds), seconds), minutes);

  return resultDate.getTime();
}

export const formatMillisecondsToTimestamp = (milliseconds: number | string | undefined): string => {
  if (milliseconds === undefined || typeof milliseconds !== 'number') {
    return 'timestamp undefined';
  }
  // Create a Date object from milliseconds
  const date = new Date(milliseconds);

  // Extract minutes, seconds, and milliseconds
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const millisecondsRemaining = date.getMilliseconds();

  // Format the timestamp string
  return `${minutes}:${seconds}.${millisecondsRemaining}`;
};

export const getNumberWithCommas = (input: number | string): string => {
  const number = typeof input === 'number' ? input : parseFloat(input);

  if (isNaN(number)) {
    throw new Error('Input is not a valid number');
  }

  return number.toLocaleString('en-US');
}

export const getFormattedErgName = (erg: 'row' | 'bike' | 'ski'): string => {
  return erg[0].toUpperCase() + erg.slice(1).toLowerCase() + "Erg";
}

export const getFullDate = (input: string) => {
  return format(new Date(input), "EEEE, MMM d, yyyy");
}