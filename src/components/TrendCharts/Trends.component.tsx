import { Radio, RadioGroup } from "@mantine/core";
import { BarChartComponent } from "./BarChart.component.tsx";
import {
  formatMillisecondsToTimestamp,
  getFormattedDistanceString,
} from "../../services/formatting_utils.ts";
import { useState } from "react";
import { TrendsDataIF } from "../../types/types.ts";
import {
  BIKE_ERG_COLOR,
  ROW_ERG_COLOR,
  SKI_ERG_COLOR,
} from "../../consts/consts.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";

interface TrendsComponentIF {
  trends: TrendsDataIF;
}

function getColorForErgType(ergType: string) {
  switch (ergType) {
    case "rowErg":
      return ROW_ERG_COLOR; // Hex color for rowErg
    case "bikeErg":
      return BIKE_ERG_COLOR; // Hex color for bikeErg
    case "skiErg":
      return SKI_ERG_COLOR; // Hex color for skiErg
    default:
      return "#000000"; // Default color if ergType doesn't match any case
  }
}

export const TrendsComponent: React.FC<TrendsComponentIF> = ({ trends }) => {
  const ergDataState = useSelector((state: RootState) => state.ergData);

  const [chartErgType, setChartErgType] = useState("rowErg");

  const handleChartErgTypeRadio = (e: string) => {
    setChartErgType(e);
  };

  return (
    <>
      <div className={"radio-group-inline"}>
        <h2>Trends for </h2>
        <RadioGroup
          value={chartErgType}
          onChange={handleChartErgTypeRadio}
          className="radio-group"
        >
          <div>
            <Radio
              disabled={!ergDataState.hasRowErg}
              value="rowErg"
              label="RowErg"
            />
          </div>
          <div>
            <Radio
              disabled={!ergDataState.hasBikeErg}
              value="bikeErg"
              label="BikeErg"
            />
          </div>
          <div>
            <Radio
              disabled={!ergDataState.hasSkiErg}
              value="skiErg"
              label="SkiErg"
            />
          </div>
        </RadioGroup>
      </div>
      <BarChartComponent
        title={"Distance"}
        data={
          chartErgType === "rowErg"
            ? trends?.distance.rowErg
            : chartErgType === "bikeErg"
              ? trends?.distance.bikeErg
              : chartErgType === "skiErg"
                ? trends?.distance.skiErg
                : []
        }
        dataKey={"value"}
        hexFill={getColorForErgType(chartErgType)}
        tickFormatter={getFormattedDistanceString}
      />
      <BarChartComponent
        title={"Pace"}
        data={
          chartErgType === "rowErg"
            ? trends?.pace.rowErg
            : chartErgType === "bikeErg"
              ? trends?.pace.bikeErg
              : chartErgType === "skiErg"
                ? trends?.pace.skiErg
                : []
        }
        dataKey={"value"}
        hexFill={getColorForErgType(chartErgType)}
        tickFormatter={formatMillisecondsToTimestamp}
      />
    </>
  );
};
