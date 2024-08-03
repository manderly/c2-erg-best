import React from 'react';
import { Card } from '@mantine/core';
import { MonthDataIF } from '../../types/types.ts';
import { isCurrentMonth } from '../../services/formatting_utils.ts';
import { ErgData } from './ErgData.tsx';
import CalendarComponent from "./Calendar.component.tsx";

interface IndividualCardIF {
  month: string;
  data: MonthDataIF;
}

const IndividualCardComponent: React.FC<IndividualCardIF> = ({ month, data }) => {
  return (
    <Card className={`month-card ${isCurrentMonth(month) ? 'current-month' : ''}`}>
      <div className={"month-card-title pad-bottom"}>
        <span className={"month-name"}>{data.name}</span>
        <span className={"year-name"}>{data.year === 0 ? 'No data yet' : data.year}</span>
      </div>

      <CalendarComponent month={month} data={data}/>

      <h5>{data.rowErgCount + data.bikeErgCount + data.skiErgCount} workouts</h5>
      {data.rowErgCount > 0 && <ErgData label="RowErg" data={data.rowErg} workoutCount={data.rowErgCount} distanceUnits="500" strokeUnits="per min" />}
      {data.bikeErgCount > 0 && <ErgData label="BikeErg" data={data.bikeErg} workoutCount={data.bikeErgCount} distanceUnits="1,000" strokeUnits="rpm" />}
      {data.skiErgCount > 0 && <ErgData label="SkiErg" data={data.skiErg} workoutCount={data.skiErgCount} />}
    </Card>
  );
};

export default IndividualCardComponent;