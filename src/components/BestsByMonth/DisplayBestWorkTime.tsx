import React from "react";
import { BestWorkoutInCategoryIF } from "../../types/types.ts";
import { Divider, Flex, TooltipFloating } from "@mantine/core";
import ViewWorkoutLink from "./ViewWorkoutLink.tsx";
import {
  getFormattedDuration,
  getFullDate,
} from "../../services/formatting_utils.ts";

interface DisplayBestWorkTimeIF {
  data: BestWorkoutInCategoryIF;
}

const DisplayBestWorkTime: React.FC<DisplayBestWorkTimeIF> = ({ data }) => {
  const formattedWorkTime = getFormattedDuration(Number(data.value));
  return (
    <div className={"best-data"}>
      <Flex justify="space-between">
        <strong>Longest Session</strong>
        <ViewWorkoutLink id={data.workoutId} />
      </Flex>
      <Divider />
      <TooltipFloating label={"hours : mins : seconds"}>
        <div className={"best-data-value"}>{`${formattedWorkTime}`}</div>
      </TooltipFloating>
      <div className={"tiny-units"}>on {getFullDate(data.date)}</div>
    </div>
  );
};

export default DisplayBestWorkTime;
