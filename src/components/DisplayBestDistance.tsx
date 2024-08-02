import React from 'react';
import { BestWorkoutInCategoryIF } from "../types/types";
import { Divider, Flex } from "@mantine/core";
import { getFormattedDistanceString } from '../../src/services/formatting_utils';
import ViewWorkoutLink from "./ViewWorkoutLink.tsx"; // Adjust the path as needed

interface DisplayBestDistanceIF {
  data: BestWorkoutInCategoryIF;
}

const DisplayBestDistance: React.FC<DisplayBestDistanceIF> = ({ data }) => {
  return (
    <div className={'best-data'}>
      <Flex justify="space-between">
        <strong>Best Distance</strong>
        <ViewWorkoutLink id={data.workoutId} />
      </Flex>
      <Divider />
      <div className={'best-data-value'}>{`${getFormattedDistanceString(data.value)}`}</div>
      <div className={'tiny-date'}>on {data.date}</div>
    </div>
  );
};

export default DisplayBestDistance;