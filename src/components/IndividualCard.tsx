import React from 'react';
import { Card } from '@mantine/core';
import { MonthDataIF } from '../types/types';
import { isCurrentMonth } from '../services/formatting_utils';
import { ErgData } from './ErgData';
import Calendar from "./Calendar.tsx";

interface IndividualCardIF {
  month: string;
  data: MonthDataIF;
}

const IndividualCard: React.FC<IndividualCardIF> = ({ month, data }) => {
  return (
    <Card className={`month-card ${isCurrentMonth(month) ? 'current-month' : ''}`}>
      <h2>{data.name}</h2>
      <h4 className="pad-bottom">{data.year === 0 ? 'No data yet' : data.year}</h4>

      <Calendar month={month} data={data} />

      <h5>{data.rowErgCount + data.bikeErgCount + data.skiErgCount} workouts</h5>
      {data.rowErgCount > 0 && <ErgData label="RowErg" data={data.rowErg} workoutCount={data.rowErgCount} distanceUnits="500" strokeUnits="per min" />}
      {data.bikeErgCount > 0 && <ErgData label="BikeErg" data={data.bikeErg} workoutCount={data.bikeErgCount} distanceUnits="1,000" strokeUnits="rpm" />}
      {data.skiErgCount > 0 && <ErgData label="SkiErg" data={data.skiErg} workoutCount={data.skiErgCount} />}
    </Card>
  );
};

export default IndividualCard;