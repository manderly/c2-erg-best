import React from 'react';
import { Divider, Flex } from '@mantine/core';
import { BestWorkoutInCategoryIF } from '../types/types';
import ViewWorkoutLink from './ViewWorkoutLink';

interface DisplayBestPaceIF {
  data: BestWorkoutInCategoryIF;
  distanceUnits: string;
}

const DisplayBestPace: React.FC<DisplayBestPaceIF> = ({ data, distanceUnits }) => {
  return (
    <div className={'best-data'}>
      <Flex justify="space-between">
        <strong>Pace</strong>
        <ViewWorkoutLink id={data.workoutId} />
      </Flex>
      <Divider />
      <div className={'best-data-value'}>{`${data.value} / ${distanceUnits}m`}</div>
      <div className={'tiny-date'}>on {data.date}</div>
    </div>
  );
};

export default DisplayBestPace;