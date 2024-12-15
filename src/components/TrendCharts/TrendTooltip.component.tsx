import {
  formatMillisecondsToTimestamp,
  getFormattedDistanceString,
  getFormattedErgName,
} from "../../services/formatting_utils.ts";
import { englishMonths } from "../../consts/consts.ts";
import React from "react";
import { ErgType } from "../../types/types.ts";

interface PayloadItem {
  payload: {
    month: number;
    value: number;
    ergType: ErgType;
    stat: "distance" | "pace";
  };
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
  label?: number;
}

export const TrendTooltip: React.FC<TrendTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    // value can represent a total meters or an average pace
    const stat = payload[0].payload?.stat;
    const value = payload[0].payload?.value;

    const displayValue =
      stat === "distance"
        ? getFormattedDistanceString(value)
        : formatMillisecondsToTimestamp(value);
    const ergType = getFormattedErgName(payload[0].payload?.ergType);

    return (
      <div className="trend-tooltip">
        <div className="label">{label && englishMonths[label - 1]}</div>
        <div>
          {displayValue} on {ergType}
        </div>
      </div>
    );
  }
};
