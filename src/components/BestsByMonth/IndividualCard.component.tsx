import React from "react";
import { Card } from "@mantine/core";
import { MonthDataIF } from "../../types/types.ts";
import {
  isCurrentMonthAndYear,
  isFutureMonthAndYear,
} from "../../services/formatting_utils.ts";
import CalendarComponent from "./Calendar.component.tsx";
import TotalsComponent from "../TotalsComponent.tsx";

interface IndividualCardIF {
  month: string;
  data: MonthDataIF;
  onClick?: () => void;
}

const IndividualCardComponent: React.FC<IndividualCardIF> = ({
  month,
  data,
  onClick,
}) => {
  const current = isCurrentMonthAndYear(month, String(data.year));
  const future = isFutureMonthAndYear(month, String(data.year));

  // Month-level totals for the entire month
  const combinedCount =
    (data.rowErg?.sessionCount || 0) +
    (data.bikeErg?.sessionCount || 0) +
    (data.skiErg?.sessionCount || 0);
  const combinedMeters = (
    (data.rowErg?.workDistanceSum || 0) +
    (data.bikeErg?.workDistanceSum || 0) +
    (data.skiErg?.workDistanceSum || 0)
  ).toLocaleString();
  const workTimeSum =
    (data.rowErg?.workTimeSum || 0) +
    (data.bikeErg?.workTimeSum || 0) +
    (data.skiErg?.workTimeSum || 0);
  const hours = Math.floor(workTimeSum / 3600);
  const minutes = Math.floor((workTimeSum % 3600) / 60);
  const combinedWorkTime = `${hours}h ${minutes}m`;

  return (
    <Card
      className={`month-card ${current ? "current-month" : ""} ${future ? "month-card-dim" : ""}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined }}
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
    </Card>
  );
};

export default IndividualCardComponent;
