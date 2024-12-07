import React from 'react';
import { BestWorkoutInCategoryIF } from "../../types/types.ts";
import { Divider, Flex } from "@mantine/core";
import {getFormattedDistanceString, getFullDate} from '../../services/formatting_utils.ts';
import ViewWorkoutLink from "./ViewWorkoutLink.tsx"; // Adjust the path as needed

interface DisplayBestDistanceIF {
  data: BestWorkoutInCategoryIF;
}

const DisplayBestDistance: React.FC<DisplayBestDistanceIF> = ({ data }) => {
  return (
    <div className={'best-data'}>
      <Flex justify="space-between">
        <strong>Longest Distance</strong>
        <ViewWorkoutLink id={data.workoutId} />
      </Flex>
      <Divider />
      <div className={'best-data-value'}>{`${getFormattedDistanceString(data.value)}`}</div>
      <div className={'tiny-units'}>on {getFullDate(data.date)}</div>
    </div>
  );
};

export default DisplayBestDistance;