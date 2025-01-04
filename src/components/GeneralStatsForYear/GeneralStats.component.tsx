import React from "react";
import ErgDataSummary from "./ErgDataSummary.tsx";
import {
  getFormattedDistanceString,
  getFormattedDuration,
  getFormattedEpochDate,
} from "../../services/formatting_utils.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";
import { GeneralStatDataIF } from "../../types/types.ts";
import { RIDICULOUS_FUTURE_TIMESTAMP } from "../../consts/consts.ts";

interface GeneralStatsIF {
  fileCount: number;
  sessionsCount: number;
  data: GeneralStatDataIF;
}

const GeneralStats: React.FC<GeneralStatsIF> = ({
  fileCount,
  sessionsCount,
  data,
}) => {
  const ergDataState = useSelector((state: RootState) => state.ergData);

  let dateRange = " -- ";
  if (data.earliestDate < RIDICULOUS_FUTURE_TIMESTAMP) {
    dateRange = `${getFormattedEpochDate(data.earliestDate)} - ${getFormattedEpochDate(data.latestDate)}`;
  }

  return (
    <div className="flex-row">
      <div
        className={`${!ergDataState.isDoneLoadingCSVData ? "unloaded-text" : ""} flex-column`}
      >
        <h2>
          Your Erg Data Summary (all files)
          {`${ergDataState.isDoneLoadingCSVData ? "🏅" : ""}`}
        </h2>
        <ErgDataSummary label={"Files uploaded"} value={fileCount} />
        <ErgDataSummary label={"Date range"} value={dateRange} />
        <ErgDataSummary
          label={"Total meters"}
          value={getFormattedDistanceString(data.totalMeters, false)}
        />
        <ErgDataSummary
          label={"Sessions"}
          value={sessionsCount > 0 ? sessionsCount : " -- "}
        />
        <ErgDataSummary
          label={"Time spent Ergin'"}
          value={getFormattedDuration(data.totalErgTime, true)}
        />
      </div>
    </div>
  );
};

export default GeneralStats;
