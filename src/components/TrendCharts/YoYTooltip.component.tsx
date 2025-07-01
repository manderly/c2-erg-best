import { getFormattedDistanceString } from "../../services/formatting_utils.ts";
import { englishMonths } from "../../consts/consts.ts";
import React from "react";

interface PayloadItem {
  payload: {
    year: string;
    rowErgMeters: number;
    bikeErgMeters: number;
    skiErgMeters: number;
  };
}

interface YoYTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
  label?: number;
}

export const YoYTooltip: React.FC<YoYTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const sumMeters =
      payload[0].payload?.rowErgMeters +
      payload[0].payload?.bikeErgMeters +
      payload[0].payload?.skiErgMeters;

    return (
      <div className="trend-tooltip">
        <div className="label">{label && englishMonths[label - 1]}</div>
        <div>
          <div>
            You erg'd {getFormattedDistanceString(sumMeters)} in{" "}
            {payload[0].payload?.year}
          </div>
          <div>Good job!</div>
        </div>
      </div>
    );
  }
};
