import React from "react";
import { BestWorkoutInCategoryIF } from "../../types/types.ts";
import { Divider, Flex } from "@mantine/core";
import ViewWorkoutLink from "./ViewWorkoutLink.tsx";
import { getFullDate } from "../../services/formatting_utils.ts";

interface DisplayBestStrokeIF {
  data: BestWorkoutInCategoryIF;
  strokeUnits: string;
}

const DisplayBestStroke: React.FC<DisplayBestStrokeIF> = ({
  data,
  strokeUnits,
}) => {
  return (
    <div className={"best-data"}>
      <Flex justify="space-between">
        <strong>Best Stroke Avg.</strong>
        <ViewWorkoutLink id={data.workoutId} />
      </Flex>
      <Divider />
      <div className={"best-data-value best-value-with-tiny-units"}>
        {`${data.value}`} <div className={"tiny-units"}>{strokeUnits}</div>
      </div>
      <div className={"tiny-units"}>on {getFullDate(data.date)}</div>
    </div>
  );
};

export default DisplayBestStroke;
