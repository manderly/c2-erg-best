import React from "react";
import { MonthDataIF } from "../../types/types";
import TotalsComponent from "../TotalsComponent";
import { getFormattedDistanceString } from "../../services/formatting_utils";
import { ErgData } from "./ErgData.tsx";

interface MonthDataProps {
  monthData: MonthDataIF | null;
}

const MonthData: React.FC<MonthDataProps> = ({ monthData }) => {
  if (!monthData)
    return (
      <div className="month-data-container">
        Select a month to view details.
      </div>
    );

  const combinedCount =
    (monthData.rowErg?.sessionCount || 0) +
    (monthData.bikeErg?.sessionCount || 0) +
    (monthData.skiErg?.sessionCount || 0);
  const combinedMeters = getFormattedDistanceString(
    (monthData.rowErg?.workDistanceSum || 0) +
      (monthData.bikeErg?.workDistanceSum || 0) +
      (monthData.skiErg?.workDistanceSum || 0),
    false,
  );
  const workTimeSum =
    (monthData.rowErg?.workTimeSum || 0) +
    (monthData.bikeErg?.workTimeSum || 0) +
    (monthData.skiErg?.workTimeSum || 0);
  const hours = Math.floor(workTimeSum / 3600);
  const minutes = Math.floor((workTimeSum % 3600) / 60);
  const combinedWorkTime = `${hours}h ${minutes}m`;

  return (
    <div className="month-data-container">
      <h3>
        {monthData.name} {monthData.year}
      </h3>
      <TotalsComponent
        label={"Total"}
        sessions={combinedCount}
        meters={combinedMeters}
        workTime={combinedWorkTime}
      />
      {monthData.rowErg && monthData.rowErg.sessionCount > 0 && (
        <ErgData
          label="rowErg"
          data={monthData.rowErg}
          workoutCount={monthData.rowErg.sessionCount}
          distanceUnits="500"
        />
      )}
      {monthData.bikeErg && monthData.bikeErg.sessionCount > 0 && (
        <ErgData
          label="bikeErg"
          data={monthData.bikeErg}
          workoutCount={monthData.bikeErg.sessionCount}
          distanceUnits="1,000"
        />
      )}
      {monthData.skiErg && monthData.skiErg.sessionCount > 0 && (
        <ErgData
          label="skiErg"
          data={monthData.skiErg}
          workoutCount={monthData.skiErg.sessionCount}
        />
      )}
    </div>
  );
};

export default MonthData;
