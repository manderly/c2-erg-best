import React from "react";
import { TooltipFloating } from "@mantine/core";
import {
  getFormattedDistanceString,
  getFormattedErgName,
} from "../../services/formatting_utils.ts";

interface SegmentIF {
  proportion: number;
  meters: number;
  erg: "row" | "bike" | "ski";
}

const Segment: React.FC<SegmentIF> = ({ proportion, meters, erg }) => {
  const machineName = getFormattedErgName(erg);
  const formattedMeters = getFormattedDistanceString(meters, false);

  return (
    <TooltipFloating label={`${formattedMeters} ${machineName} meters`}>
      <div
        className={`${erg}-erg-proportion`}
        style={{ width: `${proportion}%` }}
      >
        {machineName} {proportion}%
      </div>
    </TooltipFloating>
  );
};

export default Segment;
