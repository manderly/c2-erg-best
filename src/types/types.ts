export type ErgType = 'rowErg' | 'skiErg' | 'bikeErg';

export type DisplayRowType = {
  label: string,
  date: string,
  type: string,
}

export type WorkoutDataType = {
  data: DisplayRowType,
}

export type WorkoutRowType = {
  dateRaw: string,
  date: string,
  startTime: string,
  type: string,
  description: string,
  pace: string,
  workTime: string,
  restTime: string,
  workDistance: number,
  restDistance: number,
  strokeRate: number,
  strokeCount: number,
  totalCal: string,
  avgHeartRate: number,
  dragFactor: number,
  ranked: boolean,
  id: string,
}

export interface RowData {
  distance: number;
  pace: string;
  strokeRate: number;
}

export interface BestIF {
  value: number | string;
  date: string;
  workoutId: string;
}

export interface BestDataIF {
  bestDistance: BestIF;
  bestPace: BestIF;
  bestStroke: BestIF;
}

export interface BestMonthIF {
  name: string;
  year: number;
  rowErg: BestDataIF;
  bikeErg: BestDataIF;
  skiErg: BestDataIF;
}

export interface RowIF { // ag-grid row, not erg row
  valueFormatted: string,
}