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
}

export type ErgDataByYear = {
  [year: string]: {
    [month: string]: MonthDataIF;
  };
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

export interface GeneralStatDataIF {
  totalMeters: number;
  totalErgTime: number;
  earliestDate: number;
  latestDate: number;
  years: string[];
}

export interface TrendDataIF {
  month: string;
  rowErg?: number;
  bikeErg?: number;
  skiErg?: number;
  stat: "distance";
}
