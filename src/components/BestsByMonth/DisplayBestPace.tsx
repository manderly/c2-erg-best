import React from 'react';
import { Divider, Flex } from '@mantine/core';
import { BestWorkoutInCategoryIF } from '../../types/types.ts';
import ViewWorkoutLink from './ViewWorkoutLink.tsx';
import {getFullDate} from "../../services/formatting_utils.ts";

interface DisplayBestPaceIF {
  data: BestWorkoutInCategoryIF;
  distanceUnits: string;
}

const DisplayBestPace: React.FC<DisplayBestPaceIF> = ({ data, distanceUnits }) => {
  return (
    <div className={'best-data'}>
      <Flex justify="space-between">
        <strong>Fastest Pace</strong>
        <ViewWorkoutLink id={data.workoutId} />
      </Flex>
      <Divider />
      <div className={'best-data-value best-value-with-tiny-units'}>
          {`${data.value}`}<div className={'tiny-units'}> / {distanceUnits}m</div>
      </div>
        <div className={'tiny-units'}>on {getFullDate(data.date)}</div>
    </div>
  );
};

export default DisplayBestPace;