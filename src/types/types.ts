export type ErgType = "rowErg" | "skiErg" | "bikeErg";

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
  rowErgDates: CalendarDataIF[] | undefined[];
  bikeErgDates: CalendarDataIF[] | undefined[];
  skiErgDates: CalendarDataIF[] | undefined[];
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

export interface TrendsDataIF {
  distance: {
    rowErg: DateAndDistanceIF[];
    bikeErg: DateAndDistanceIF[];
    skiErg: DateAndDistanceIF[];
  };
  pace: {
    rowErg: DateAndPaceIF[];
    bikeErg: DateAndPaceIF[];
    skiErg: DateAndPaceIF[];
  };
  time: {
    rowErg: DateAndWorkTimeIF[];
    bikeErg: DateAndWorkTimeIF[];
    skiErg: DateAndWorkTimeIF[];
  };
}

export interface DateAndDistanceIF {
  date: string;
  distance: number;
}

export interface DateAndPaceIF {
  date: string;
  pace: number;
}

export interface DateAndWorkTimeIF {
  date: string;
  workTime: number;
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

export interface CalendarDataIF {
  date: string;
  ergType: string;
  distance: string;
  time: string;
}

export interface WorkDistanceSumsIF {
  rowErg: number;
  bikeErg: number;
  skiErg: number;
}
