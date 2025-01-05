import React from "react";
import ErgDataSummary from "./ErgDataSummary.tsx";
import {
  getFormattedDistanceString,
  getFormattedDuration,
  getFormattedErgName,
} from "../../services/formatting_utils.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";
import { ErgDataByYear, ErgType } from "../../types/types.ts";
import { englishMonths } from "../../consts/consts.ts";
import _ from "lodash";

interface YearOrSeasonStatsIF {
  data: ErgDataByYear;
}

interface ErgSummaryProps {
  type: "rowErg" | "bikeErg" | "skiErg";
  data: { meters: number; sessions: number; time: number };
}

const ErgSummary: React.FC<ErgSummaryProps> = ({ type, data }) => {
  if (data.meters === 0) return null;

  return (
    <div className={`year-stat-box ${type}-border`}>
      <strong className={`erg-type-label ${type}-label`}>
        {getFormattedErgName(type)}
      </strong>
      <div className={"pad-top"}>
        <ErgDataSummary
          label={"Meters"}
          value={getFormattedDistanceString(data.meters)}
        />
        <ErgDataSummary label={"Sessions"} value={data.sessions} />
        <ErgDataSummary
          label={"Time"}
          value={getFormattedDuration(data.time)}
        />
      </div>
    </div>
  );
};

const sumMetrics = (
  data: ErgDataByYear,
  year: string,
  months: string[],
  ergType: ErgType,
): { meters: number; sessions: number; time: number } => {
  let metersSum = 0;
  let sessionsSum = 0;
  let timeSum = 0;

  if (!_.isEmpty(data)) {
    months.forEach((month) => {
      const ergData = data[year][month]?.[ergType];
      if (ergData) {
        metersSum += ergData.workDistanceSum ?? 0;
        sessionsSum += ergData.sessionCount ?? 0;
        timeSum += (ergData.workTimeSum ?? 0) + (ergData.restTimeSum ?? 0);
      }
    });
  }

  return { meters: metersSum, sessions: sessionsSum, time: timeSum };
};

const YearOrSeasonStats: React.FC<YearOrSeasonStatsIF> = ({ data }) => {
  const ergDataState = useSelector((state: RootState) => state.ergData);
  const year = ergDataState.viewingYear;

  const rowErgData = sumMetrics(data, year, englishMonths, "rowErg");
  const bikeErgData = sumMetrics(data, year, englishMonths, "bikeErg");
  const skiErgData = sumMetrics(data, year, englishMonths, "skiErg");

  const totalMeters =
    rowErgData.meters + bikeErgData.meters + skiErgData.meters;

  return (
    <div className="flex-row">
      <div
        className={`${!ergDataState.isDoneLoadingCSVData ? "unloaded-text" : ""} flex-column width-100`}
      >
        <h2>
          {year} Summary
          {`${ergDataState.isDoneLoadingCSVData ? "🏅" : ""}`}
        </h2>
        <ErgDataSummary
          label={"Total meters"}
          value={getFormattedDistanceString(totalMeters, false)}
        />
        <ErgSummary type="rowErg" data={rowErgData} />
        <ErgSummary type="bikeErg" data={bikeErgData} />
        <ErgSummary type="skiErg" data={skiErgData} />
      </div>
    </div>
  );
};

export default YearOrSeasonStats;
