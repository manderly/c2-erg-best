import {format, intervalToDuration} from "date-fns";

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

export const getFormattedTime = (item) => {
  return item ? format(new Date(item), "hh:mm aaa") : 'not a date';
}
