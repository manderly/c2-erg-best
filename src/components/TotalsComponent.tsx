import React from "react";

interface TotalsComponentIF {
  sessions: number;
  meters: string;
  workTime: string;
  label?: string;
}

const TotalsComponent: React.FC<TotalsComponentIF> = ({
  sessions,
  meters,
  workTime,
  label,
}) => {
  const sessionsLabel = label ? `${label} sessions` : "Sessions";
  const metersLabel = label ? `${label} meters` : "Meters";
  const timeLabel = label ? `${label} time` : "Time";

  return (
    <div className={"pad-top pad-bottom-subtle"}>
      <div className={"totals-label-and-value"}>
        {sessionsLabel}: <div>{sessions}</div>
      </div>
      <div className={"totals-label-and-value"}>
        {metersLabel}: <div>{meters}</div>
      </div>
      <div className={"totals-label-and-value"}>
        {timeLabel}: <div>{workTime}</div>
      </div>
    </div>
  );
};

export default TotalsComponent;
