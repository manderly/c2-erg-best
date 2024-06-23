import {BestDataForErgIF} from "../types/types.ts";
import DisplayBestStroke from "./DisplayBestStroke.tsx";
import DisplayBestDistance from "./DisplayBestDistance.tsx";
import DisplayBestPace from "./DisplayBestPace.tsx";

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
        <ul>
            <li><DisplayBestPace data={data.bestPace} distanceUnits={distanceUnits}/></li>
            <li><DisplayBestDistance data={data.bestDistance}/></li>
            <li><DisplayBestStroke data={data.bestStroke} strokeUnits={strokeUnits}/></li>
        </ul>
    </>
    }
  </>
}