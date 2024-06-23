import {BestDataForErgIF} from "../types/types.ts";
import DisplayBestStroke from "./DisplayBestStroke.tsx";
import DisplayBestDistance from "./DisplayBestDistance.tsx";
import DisplayBestPace from "./DisplayBestPace.tsx";
import React from "react";

interface ErgDataIF {
  label: string,
  data: BestDataForErgIF,
  distanceUnits?: string,
  strokeUnits?: string,
}
export const ErgData: React.FC<ErgDataIF> = ({label, data, distanceUnits = '500', strokeUnits = 'per min.' }) => {
  return <>
    {data && <>
        <strong className={`erg-type-label ${label}-label`}>{label}</strong>
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
  </>
}