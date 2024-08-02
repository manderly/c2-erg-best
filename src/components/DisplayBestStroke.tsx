import React from 'react';
import { BestWorkoutInCategoryIF } from "../types/types";
import { Divider, Flex } from "@mantine/core";
import ViewWorkoutLink from "./ViewWorkoutLink.tsx";

interface DisplayBestStrokeIF {
  data: BestWorkoutInCategoryIF;
  strokeUnits: string;
}

const DisplayBestStroke: React.FC<DisplayBestStrokeIF> = ({ data, strokeUnits }) => {
  return (
    <div className={'best-data'}>
      <Flex justify="space-between">
        <strong>Best Stroke</strong>
        <ViewWorkoutLink id={data.workoutId} />
      </Flex>
      <Divider />
      <div className={'best-data-value'}>{`${data.value} ${strokeUnits}`}</div>
      <div className={'tiny-date'}>on {data.date}</div>
    </div>
  );
};

export default DisplayBestStroke;