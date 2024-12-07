import React from 'react';
import {WorkDistanceSumsIF} from "../../types/types.ts";
import Segment from "./Segment.tsx";

interface ErgProportionsIF {
    workDistanceSums: WorkDistanceSumsIF;
}

const ErgProportions: React.FC<ErgProportionsIF> = ({ workDistanceSums }) => {
    const totalMeters = workDistanceSums.rowErg + workDistanceSums.bikeErg + workDistanceSums.skiErg;

    const rowErg = Math.round(workDistanceSums.rowErg / totalMeters * 100);
    const bikeErg = Math.round(workDistanceSums.bikeErg / totalMeters * 100);
    const skiErg = Math.round(workDistanceSums.skiErg / totalMeters * 100);

    return (
        <div className={"proportions-meter"}>
            {rowErg > 0 && <Segment meters={workDistanceSums.rowErg} erg={"row"} proportion={rowErg}/>}
            {bikeErg > 0 && <Segment meters={workDistanceSums.bikeErg} erg={"bike"} proportion={bikeErg}/>}
            {skiErg > 0 && <Segment meters={workDistanceSums.skiErg} erg={"ski"} proportion={skiErg}/>}
        </div>
    )
};

export default ErgProportions;