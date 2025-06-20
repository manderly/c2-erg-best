import { getFormattedDistanceString } from "../../services/formatting_utils.ts";
import { englishMonths } from "../../consts/consts.ts";
import React from "react";

interface PayloadItem {
  payload: {
    year: string;
    meters: number;
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
    return (
      <div className="trend-tooltip">
        <div className="label">{label && englishMonths[label - 1]}</div>
        <div>
          <div>
            You erg'd {getFormattedDistanceString(payload[0].payload?.meters)}{" "}
            in {payload[0].payload?.year}
          </div>
          <div>Good job!</div>
        </div>
      </div>
    );
  }
};
