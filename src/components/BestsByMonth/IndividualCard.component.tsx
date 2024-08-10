import React from 'react';
import { Card } from '@mantine/core';
import { MonthDataIF } from '../../types/types.ts';
import { isCurrentMonth } from '../../services/formatting_utils.ts';
import { ErgData } from './ErgData.tsx';
import CalendarComponent from "./Calendar.component.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store.ts";

interface IndividualCardIF {
  month: string;
  data: MonthDataIF;
}

const IndividualCardComponent: React.FC<IndividualCardIF> = ({ month, data }) => {
  const ergDataState = useSelector((state: RootState) => state.ergData);
  return (
    <Card className={`month-card ${isCurrentMonth(month) ? 'current-month' : ''}`}>
      <div className={"month-card-title pad-bottom"}>
        <span className={"month-name"}>{data.name}</span>
        <span className={"year-name"}>{data.year === 0 ? 'No data yet' : data.year}</span>
      </div>

      <CalendarComponent month={month} data={data}/>

      <h5>{data.rowErgCount + data.bikeErgCount + data.skiErgCount} workouts</h5>
      {ergDataState.hasRowErg && <ErgData label="RowErg" data={data.rowErg} workoutCount={data.rowErgCount} distanceUnits="500" strokeUnits="per min" />}
      {ergDataState.hasBikeErg && <ErgData label="BikeErg" data={data.bikeErg} workoutCount={data.bikeErgCount} distanceUnits="1,000" strokeUnits="rpm" />}
      {ergDataState.hasSkiErg && <ErgData label="SkiErg" data={data.skiErg} workoutCount={data.skiErgCount} />}
    </Card>
  );
};

export default IndividualCardComponent;