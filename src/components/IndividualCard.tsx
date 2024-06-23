import React from 'react';
import { Card } from '@mantine/core';
import { BestMonthIF } from '../types/types';
import { isCurrentMonth } from '../services/formatting_utils';
import { ErgData } from './ErgData';

interface IndividualCardIF {
  month: string;
  data: BestMonthIF;
  hasRowErg: boolean;
  hasBikeErg: boolean;
  hasSkiErg: boolean;
}

const IndividualCard: React.FC<IndividualCardIF> = ({ month, data, hasRowErg, hasBikeErg, hasSkiErg }) => {
  return (
    <Card className={`month-card ${isCurrentMonth(month) ? 'current-month' : ''}`}>
      <h2>{data.name}</h2>
      <h4 className="pad-bottom">{data.year === 0 ? 'No data yet' : data.year}</h4>
      {hasRowErg && <ErgData label="RowErg" data={data.rowErg} distanceUnits="500" strokeUnits="per min" />}
      {hasBikeErg && <ErgData label="BikeErg" data={data.bikeErg} distanceUnits="1,000" strokeUnits="rpm" />}
      {hasSkiErg && <ErgData label="SkiErg" data={data.skiErg} />}
    </Card>
  );
};

export default IndividualCard;