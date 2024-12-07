import { BestDataForErgIF } from "../../types/types.ts";
import DisplayBestStroke from "./DisplayBestStroke.tsx";
import DisplayBestDistance from "./DisplayBestDistance.tsx";
import DisplayBestPace from "./DisplayBestPace.tsx";
import React from "react";
import DisplayBestWorkTime from "./DisplayBestWorkTime.tsx";
import {
  getFormattedDistanceString,
  getFormattedDuration,
} from "../../services/formatting_utils.ts";
import TotalsComponent from "../TotalsComponent.tsx";

interface ErgDataIF {
  label: string;
  data: BestDataForErgIF;
  workoutCount: number;
  distanceUnits?: string;
  strokeUnits?: string;
}
export const ErgData: React.FC<ErgDataIF> = ({
  label,
  data,
  workoutCount,
  distanceUnits = "500",
  strokeUnits = "per min.",
}) => {
  const formattedWorkDistance = getFormattedDistanceString(
    data.workDistanceSum,
    false,
  );
  return (
    <div className={`erg-data-bg erg-data-bg-${label}`}>
      {data && (
        <>
          <strong className={`erg-type-label ${label}-label`}>{label}</strong>
          <TotalsComponent
            sessions={workoutCount}
            meters={formattedWorkDistance}
            workTime={getFormattedDuration(data.workTimeSum)}
          />

          {data.bestPace.value === "999:00.0" && (
            <div className="no-data-div">No {label} data for this month</div>
          )}
          {data.bestPace.value !== "999:00.0" && (
            <ul>
              <li>
                <DisplayBestPace
                  data={data.bestPace}
                  distanceUnits={distanceUnits}
                />
              </li>
              <li>
                <DisplayBestDistance data={data.bestDistance} />
              </li>
              <li>
                <DisplayBestStroke
                  data={data.bestStroke}
                  strokeUnits={strokeUnits}
                />
              </li>
              <li>
                <DisplayBestWorkTime data={data.bestWorkTime} />
              </li>
            </ul>
          )}
        </>
      )}
    </div>
  );
};
