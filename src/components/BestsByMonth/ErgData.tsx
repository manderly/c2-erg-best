import {BestDataForErgIF} from "../../types/types.ts";
import DisplayBestStroke from "./DisplayBestStroke.tsx";
import DisplayBestDistance from "./DisplayBestDistance.tsx";
import DisplayBestPace from "./DisplayBestPace.tsx";
import React from "react";

interface ErgDataIF {
  label: string,
  data: BestDataForErgIF,
  workoutCount: number,
  distanceUnits?: string,
  strokeUnits?: string,
}
export const ErgData: React.FC<ErgDataIF> = ({label, data, workoutCount, distanceUnits = '500', strokeUnits = 'per min.' }) => {
  return <div className={`erg-data-bg erg-data-bg-${label}`}>
    {data && <>
        <strong className={`erg-type-label ${label}-label`}>{label}: {workoutCount}</strong>
        {data.bestPace.value === '999:00.0' && <div className="no-data-div">No data</div>}
        {data.bestPace.value !== '999:00.0' &&
          <ul>
              <li><DisplayBestPace data={data.bestPace} distanceUnits={distanceUnits}/></li>
              <li><DisplayBestDistance data={data.bestDistance}/></li>
              <li><DisplayBestStroke data={data.bestStroke} strokeUnits={strokeUnits}/></li>
          </ul>
        }
    </>
    }
  </div>
}