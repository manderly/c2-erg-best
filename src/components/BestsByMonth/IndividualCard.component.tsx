import React from "react";
import { Card } from "@mantine/core";
import { MonthDataIF } from "../../types/types.ts";
import {
  getFormattedDistanceString,
  getFormattedDuration,
  isCurrentMonthAndYear,
  isFutureMonthAndYear,
} from "../../services/formatting_utils.ts";
import { ErgData } from "./ErgData.tsx";
import CalendarComponent from "./Calendar.component.tsx";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";
import TotalsComponent from "../TotalsComponent.tsx";

interface IndividualCardIF {
  month: string;
  data: MonthDataIF;
}

const IndividualCardComponent: React.FC<IndividualCardIF> = ({
  month,
  data,
}) => {
  const ergDataState = useSelector((state: RootState) => state.ergData);
  const combinedCount =
    data.rowErg?.sessionCount +
    data.bikeErg?.sessionCount +
    data.skiErg?.sessionCount;
  const combinedMeters = getFormattedDistanceString(
    data.rowErg.workDistanceSum +
      data.bikeErg.workDistanceSum +
      data.skiErg.workDistanceSum,
    false,
  );
  const combinedWorkTime = getFormattedDuration(
    data.rowErg.workTimeSum +
      data.bikeErg.workTimeSum +
      data.skiErg.workTimeSum,
  );

  const current = isCurrentMonthAndYear(month, String(data.year));
  const future = isFutureMonthAndYear(month, String(data.year));

  return (
    <Card
      className={`month-card ${current ? "current-month" : ""} ${future ? "month-card-dim" : ""}`}
    >
      <div className={"month-card-title pad-bottom"}>
        <span className={"month-name"}>{data.name}</span>
        <span className={"year-name"}>
          {future ? "No data yet" : data.year}
        </span>
      </div>
      <CalendarComponent month={month} data={data} />
      <TotalsComponent
        label={"Total"}
        sessions={combinedCount}
        meters={combinedMeters}
        workTime={combinedWorkTime}
      />
      {ergDataState.hasRowErg && (
        <ErgData
          label="RowErg"
          data={data.rowErg}
          workoutCount={data["rowErg"].sessionCount}
          distanceUnits="500"
          strokeUnits="per min"
        />
      )}
      {ergDataState.hasBikeErg && (
        <ErgData
          label="BikeErg"
          data={data.bikeErg}
          workoutCount={data["bikeErg"].sessionCount}
          distanceUnits="1,000"
          strokeUnits="rpm"
        />
      )}
      {ergDataState.hasSkiErg && (
        <ErgData
          label="SkiErg"
          data={data.skiErg}
          workoutCount={data["skiErg"].sessionCount}
          strokeUnits={"minutes"}
        />
      )}
    </Card>
  );
};

export default IndividualCardComponent;
