import React from 'react';
import { BestWorkoutInCategoryIF } from "../../types/types.ts";
import {Divider, Flex, TooltipFloating} from "@mantine/core";
import ViewWorkoutLink from "./ViewWorkoutLink.tsx";
import {getFormattedDuration} from "../../services/formatting_utils.ts";

interface DisplayBestWorkTimeIF {
  data: BestWorkoutInCategoryIF;
}

const DisplayBestWorkTime: React.FC<DisplayBestWorkTimeIF> = ({ data }) => {
  const formattedWorkTime = getFormattedDuration(Number(data.value));
    return (
    <div className={'best-data'}>
      <Flex justify="space-between">
        <strong>Best Work Time</strong>
        <ViewWorkoutLink id={data.workoutId} />
      </Flex>
      <Divider />
        <TooltipFloating label={'hours : mins : seconds'}><div className={'best-data-value'}>{`${formattedWorkTime}`}</div></TooltipFloating>
      <div className={'tiny-date'}>on {data.date}</div>
    </div>
  );
};

export default DisplayBestWorkTime;