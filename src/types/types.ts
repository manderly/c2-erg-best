export type ErgType = 'rowErg' | 'skiErg' | 'bikeErg';

export type DisplayRowType = {
  label: string,
  date: string,
  type: string,
}

export interface ParsedCSVRowDataIF {
  dateRaw: string;
  date: string;
  startTime: string;
  type: ErgType;
  description: string;
  pace: string;
  workTime: string;
  restTime: string;
  workDistance: number;
  restDistance: number;
  strokeRate: number;
  strokeCount: number;
  totalCal: string;
  avgHeartRate: number;
  dragFactor: number;
  ranked: boolean;
  id: string;
}

export interface MonthDataIF {
  name: string,
  year: number,
  rowErg: BestDataForErgIF,
  bikeErg: BestDataForErgIF,
  skiErg: BestDataForErgIF,
}
export type Months = "January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December";
export type LocalBests = {
  [key in Months]?: MonthDataIF;
};

export interface DateAndDistanceIF {
  date: string;
  distance: number;
}

export interface DateAndPaceIF {
  date: string,
  pace: number
}

export type WorkoutDataType = {
  data: DisplayRowType,
}

export interface BestWorkoutInCategoryIF {
  value: number | string;
  date: string;
  workoutId: string;
}

export interface BestDataForErgIF {
  bestDistance: BestWorkoutInCategoryIF;
  bestPace: BestWorkoutInCategoryIF;
  bestStroke: BestWorkoutInCategoryIF;
}

export interface BestMonthIF {
  name: string;
  year: number;
  rowErg: BestDataForErgIF;
  bikeErg: BestDataForErgIF;
  skiErg: BestDataForErgIF;
}

export interface RowIF { // ag-grid row, not erg row
  valueFormatted: string,
}