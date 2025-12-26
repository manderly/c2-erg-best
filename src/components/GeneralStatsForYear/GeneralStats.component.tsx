import React from "react";
import ErgDataSummary from "./ErgDataSummary.tsx";
import {
  getFormattedDistanceString,
  getFormattedDuration,
  getFormattedEpochDate,
} from "../../services/formatting_utils.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";
import { ErgDataIF, YoYMetersDataIF } from "../../types/types.ts";
import { RIDICULOUS_FUTURE_TIMESTAMP } from "../../consts/consts.ts";
import { Grid } from "@mantine/core";
import { YoYBarChartComponent } from "../TrendCharts/YoYBarChart.component.tsx";

interface GeneralStatsIF {
  sessionsCount: number;
  ergData: ErgDataIF;
}

const GeneralStats: React.FC<GeneralStatsIF> = ({ sessionsCount, ergData }) => {
  const ergDataState = useSelector((state: RootState) => state.ergData);
  let dateRange = " -- ";
  if (ergData.allTimeSums.earliestDate < RIDICULOUS_FUTURE_TIMESTAMP) {
    dateRange = `${getFormattedEpochDate(ergData.allTimeSums.earliestDate)} - ${getFormattedEpochDate(ergData.allTimeSums.latestDate)}`;
  }

  const yoyMeterData = ergData.years.map((year) => {
    const months = Object.values(ergData.ergDataByYear[year]);

    const sumMeters = (
      extract: (month: (typeof months)[number]) => number,
    ): number => months.reduce((sum, month) => sum + extract(month), 0);

    return {
      year,
      rowErgMeters: sumMeters(
        (month) =>
          (month.rowErg?.workDistanceSum ?? 0) +
          (month.rowErg?.restDistanceSum ?? 0),
      ),
      bikeErgMeters: sumMeters(
        (month) =>
          (month.bikeErg?.workDistanceSum ?? 0) +
          (month.bikeErg?.restDistanceSum ?? 0),
      ),
      skiErgMeters: sumMeters(
        (month) =>
          (month.skiErg?.workDistanceSum ?? 0) +
          (month.skiErg?.restDistanceSum ?? 0),
      ),
      allMeters: sumMeters((month) => month.metersAll ?? 0),
    } as YoYMetersDataIF;
  });

  const ErgSpecificMeters = ({
    meters,
    colorClass,
    text,
  }: {
    meters: number;
    colorClass: string;
    text: string;
  }) => {
    return (
      <div className={"flex-row flex-space-between"}>
        <div className={`erg-specific-meters-container ${colorClass}`}>
          {getFormattedDistanceString(meters, false)}{" "}
        </div>
        <div className={`${colorClass}`}>{text}</div>
      </div>
    );
  };

  return (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <div
          className={`${!ergDataState.isDoneLoadingCSVData ? "unloaded-text" : ""} flex-row`}
        >
          <div className={`flex-column`}>
            <h2>
              Lifetime Erg Data
              {`${ergDataState.isDoneLoadingCSVData ? "🏅" : ""}`}{" "}
            </h2>

            <div>
              <ErgDataSummary label={"Date range"} value={dateRange} />
              <ErgDataSummary
                label={"Total meters"}
                value={getFormattedDistanceString(
                  ergData.allTimeSums.totalMeters,
                  false,
                )}
              />
              <div className={"pad-bottom"}>
                {ergDataState.hasRowErg && (
                  <ErgSpecificMeters
                    meters={ergData.allTimeSums.totalRowErgMeters}
                    colorClass={"rowErg-color"}
                    text={"RowErg"}
                  />
                )}

                {ergDataState.hasBikeErg && (
                  <ErgSpecificMeters
                    meters={ergData.allTimeSums.totalBikeErgMeters}
                    colorClass={"bikeErg-color"}
                    text={"BikeErg"}
                  />
                )}

                {ergDataState.hasSkiErg && (
                  <ErgSpecificMeters
                    meters={ergData.allTimeSums.totalSkiErgMeters}
                    colorClass={"skiErg-color"}
                    text={"SkiErg"}
                  />
                )}
              </div>
              <ErgDataSummary
                label={"Sessions"}
                value={sessionsCount > 0 ? sessionsCount : " -- "}
              />
              <ErgDataSummary
                label={"Time spent Ergin'"}
                value={getFormattedDuration(ergData.allTimeSums.totalErgTime)}
              />
            </div>
          </div>
        </div>
      </Grid.Col>

      {/*<Grid.Col span={{ base: 12, sm: 4 }}>*/}
      {/*  Machine-specific stats here*/}
      {/*</Grid.Col>*/}

      <Grid.Col span={{ base: 12, sm: 6 }}>
        <div
          className={`${!ergDataState.isDoneLoadingCSVData ? "unloaded-text" : ""}`}
        >
          <YoYBarChartComponent
            title={"Your Erg Meters, by Calendar Year"}
            hexFill={""}
            data={yoyMeterData}
            tickFormatter={getFormattedDistanceString}
          />
        </div>
      </Grid.Col>
    </Grid>
  );
};

export default GeneralStats;
