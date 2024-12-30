import React from "react";
import { Text } from "@mantine/core";

interface ErgDataSummaryIF {
  label: string;
  value: string | number;
}

const ErgDataSummary: React.FC<ErgDataSummaryIF> = ({ label, value }) => {
  return (
    <Text className={"general-stat-line"}>
      <strong>{label}: </strong>
      {value}
    </Text>
  );
};

export default ErgDataSummary;
