export type ErgType = "rowErg" | "bikeErg" | "skiErg";
export type ViewMode = "concept2Season" | "calendarYear";

export type csvRow = (string | number)[];

export type DisplayRowType = {
  label: string;
  date: number;
  type: string;
};

export interface ParsedCSVRowDataIF {
  date: number; // since epoch
  day: number;
  startTime: string;
  type: ErgType;
  description: string;
  pace: string;
  watts: number;
  workTime: number;
  restTime: number;
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
  name: string;
  year: number;
  rowErg: MonthSummaryForErgIF;
  bikeErg: MonthSummaryForErgIF;
  skiErg: MonthSummaryForErgIF;
  rowErgSessionsByDayOfMonth: SessionDataIF[][] | [];
  bikeErgSessionsByDayOfMonth: SessionDataIF[][] | [];
  skiErgSessionsByDayOfMonth: SessionDataIF[][] | [];
  metersAll: number;
}

export type ErgDataByYear = {
  [year: string]: {
    [month: string]: MonthDataIF;
  };
};

export interface AllTimeSumsDataIF {
  totalMeters: number;
  totalErgTime: number;
  earliestDate: number;
  latestDate: number;
  totalRowErgMeters: number;
  totalBikeErgMeters: number;
  totalSkiErgMeters: number;
}

/* Primary object for user's parsed erg data
- Organized by year (2024, 2025...)
- Also holds aggregated "all time" data that was calculated during initial parsing
*/
export type ErgDataIF = {
  ergDataByYear: ErgDataByYear;
  allTimeSums: AllTimeSumsDataIF;
  years: string[];
};

export type WorkoutDataType = {
  data: DisplayRowType;
};

export interface BestWorkoutInCategoryIF {
  value: number | string;
  date: number;
  workoutId: string;
}

export interface MonthSummaryForErgIF {
  bestDistance: BestWorkoutInCategoryIF;
  bestPace: BestWorkoutInCategoryIF;
  bestStroke: BestWorkoutInCategoryIF;
  bestWorkTime: BestWorkoutInCategoryIF;
  bestWattsAvg: BestWorkoutInCategoryIF;
  workDistanceSum: number;
  restDistanceSum: number;
  workTimeSum: number;
  restTimeSum: number;
  sessionCount: number;
}

export interface RowIF {
  // ag-grid row, not erg row
  valueFormatted: string;
}

export interface SessionDataIF {
  date: number;
  ergType: string;
  distance: number;
  time: string;
}

export interface WorkDistanceSumsIF {
  rowErg: number;
  bikeErg: number;
  skiErg: number;
}

export interface TrendDataIF {
  month: string;
  rowErg?: number;
  bikeErg?: number;
  skiErg?: number;
  stat: "distance";
}

export interface YoYMetersDataIF {
  year: string;
  allMeters: number;
  rowErgMeters: number;
  bikeErgMeters: number;
  skiErgMeters: number;
}
