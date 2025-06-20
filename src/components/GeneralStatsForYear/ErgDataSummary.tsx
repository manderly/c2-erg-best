import React from "react";
import { Divider } from "@mantine/core";

interface ErgDataSummaryIF {
  label: string;
  value: string | number;
}

const ErgDataSummary: React.FC<ErgDataSummaryIF> = ({ label, value }) => {
  return (
    <>
      <h5>{label}</h5>
      <Divider />
      <div className={`stat-value pad-bottom-subtle`}>{value}</div>
    </>
  );
};

export default ErgDataSummary;
