import React from "react";
import { BestWorkoutInCategoryIF } from "../../types/types.ts";
import { Divider, Flex } from "@mantine/core";
import { getFullDate } from "../../services/formatting_utils.ts";
import ViewWorkoutLink from "./ViewWorkoutLink.tsx";

interface DisplayBestWattsIF {
  data: BestWorkoutInCategoryIF;
}

const DisplayBestWatts: React.FC<DisplayBestWattsIF> = ({ data }) => {
  return (
    <div className={"best-data"}>
      <Flex justify="space-between">
        <strong>Best Watts Avg.</strong>
        <ViewWorkoutLink id={data.workoutId} />
      </Flex>
      <Divider />
      <div className={"best-data-value"}>{`${data.value}`}</div>
      <div className={"tiny-units"}>on {getFullDate(data.date)}</div>
    </div>
  );
};

export default DisplayBestWatts;
