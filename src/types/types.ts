export type ErgType = "rowErg" | "bikeErg" | "skiErg";

export type DisplayRowType = {
  label: string;
  date: string;
  type: string;
};

export interface ParsedCSVRowDataIF {
  dateRaw: string;
  date: string;
  day: number;
  startTime: string;
  type: ErgType;
  description: string;
  pace: string;
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
  rowErg: BestDataForErgIF;
  bikeErg: BestDataForErgIF;
  skiErg: BestDataForErgIF;
  rowErgCount: number;
  bikeErgCount: number;
  skiErgCount: number;
  rowErgSessionsByDayOfMonth: SessionDataIF[][] | [];
  bikeErgSessionsByDayOfMonth: SessionDataIF[][] | [];
  skiErgSessionsByDayOfMonth: SessionDataIF[][] | [];
}
export type Months =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";
export type LocalBests = {
  [key in Months]?: MonthDataIF;
};

export interface TrendDataGroupedIF {
  month: number;
  value: number; // sum of meters or average pace in milliseconds
  ergType: ErgType;
  stat: "distance" | "pace";
}

export interface TrendsDataIF {
  distance: {
    rowErg: TrendDataGroupedIF[];
    bikeErg: TrendDataGroupedIF[];
    skiErg: TrendDataGroupedIF[];
  };
  pace: {
    rowErg: TrendDataGroupedIF[];
    bikeErg: TrendDataGroupedIF[];
    skiErg: TrendDataGroupedIF[];
  };
  time: {
    rowErg: TrendDataGroupedIF[];
    bikeErg: TrendDataGroupedIF[];
    skiErg: TrendDataGroupedIF[];
  };
}

export interface DateAndDistanceIF {
  date: string;
  distance: number;
  month: number;
}

export interface DateAndPaceIF {
  date: string;
  pace: number;
  month: number;
}

export interface DateAndWorkTimeIF {
  date: string;
  workTime: number;
  month: number;
}

export type WorkoutDataType = {
  data: DisplayRowType;
};

export interface BestWorkoutInCategoryIF {
  value: number | string;
  date: string;
  workoutId: string;
}

export interface BestDataForErgIF {
  bestDistance: BestWorkoutInCategoryIF;
  bestPace: BestWorkoutInCategoryIF;
  bestStroke: BestWorkoutInCategoryIF;
  bestWorkTime: BestWorkoutInCategoryIF;
  workDistanceSum: number;
  workTimeSum: number;
}

export interface RowIF {
  // ag-grid row, not erg row
  valueFormatted: string;
}

export interface SessionDataIF {
  date: string;
  ergType: string;
  distance: number;
  time: string;
}

export interface WorkDistanceSumsIF {
  rowErg: number;
  bikeErg: number;
  skiErg: number;
}
