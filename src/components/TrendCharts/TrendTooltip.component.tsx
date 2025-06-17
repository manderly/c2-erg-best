import { getFormattedDistanceString } from "../../services/formatting_utils.ts";
import { englishMonths } from "../../consts/consts.ts";
import React from "react";
import { ErgType } from "../../types/types.ts";

interface PayloadItem {
  payload: {
    month: number;
    rowErg: ErgType;
    bikeErg: ErgType;
    skiErg: ErgType;
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
    return (
      <div className="trend-tooltip">
        <div className="label">{label && englishMonths[label - 1]}</div>
        <div>
          <div>
            {getFormattedDistanceString(payload[0].payload?.rowErg)} on RowErg
          </div>
          <div>
            {getFormattedDistanceString(payload[1]?.payload?.bikeErg)} on
            BikeErg
          </div>
          <div>
            {getFormattedDistanceString(payload[2]?.payload?.skiErg)} on SkiErg
          </div>
        </div>
      </div>
    );
  }
};
