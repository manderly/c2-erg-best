import {addMilliseconds, addMinutes, addSeconds, format, getMonth, getYear, intervalToDuration} from "date-fns";

export const isCurrentMonth = (month: string) => {
  const currentMonth = getMonth(new Date()) + 1;
  return currentMonth === Number(month);
}

export const getFormattedDuration = (seconds: number) => {
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

export const getFormattedDate = (item) => {
  return item ? format(new Date(item), "ccc MM/dd/yyyy") : 'not a date';
}

export const getRowYear = (rowDate) => {
  if (!rowDate) {
    return '--';
  }
  return getYear(rowDate);
}

export const getFormattedTime = (item) => {
  return item ? format(new Date(item), "hh:mm aaa") : 'not a date';
}

export const getFormattedDistance = (item): number => {
  return item ? Number(item) : 0;
  //return item ? item.match(/\d+/) : 0;
}

export const getFormattedDistanceString = (item): string => {
  if (!item) {
    return '--';
  }
  return `${Number(item).toLocaleString()}m`;
}

export const getMonthNumber = (item) => {
  return getMonth(new Date(item)) + 1;
}

export const parseTimeToMilliseconds = (timeString: string): number => {
  const [minutesStr, secondsWithMillisecondsStr] = timeString.split(':');
  const [secondsStr, millisecondsStr] = secondsWithMillisecondsStr.split('.');

  const minutes = parseInt(minutesStr);
  const seconds = parseInt(secondsStr);
  const milliseconds = parseInt(millisecondsStr);

  const resultDate = addMinutes(addSeconds(addMilliseconds(new Date(0), milliseconds), seconds), minutes);

  return resultDate.getTime();
}