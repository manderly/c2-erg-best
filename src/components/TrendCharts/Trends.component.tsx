import { Grid } from "@mantine/core";
import { BarChartComponent } from "./BarChart.component.tsx";
import { getFormattedDistanceString } from "../../services/formatting_utils.ts";
import { useEffect, useState } from "react";
import { ErgDataByYear, TrendDataIF } from "../../types/types.ts";
import {
  BIKE_ERG_COLOR,
  englishMonths,
  ROW_ERG_COLOR,
  SKI_ERG_COLOR,
} from "../../consts/consts.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";
import _ from "lodash";

interface TrendsComponentIF {
  data: ErgDataByYear;
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

export const TrendsComponent: React.FC<TrendsComponentIF> = ({ data }) => {
  const ergDataState = useSelector((state: RootState) => state.ergData);
  const [aggregatedDistanceData, setAggregatedDistanceData] =
    useState<TrendDataIF[]>();

  useEffect(() => {
    if (data && !_.isEmpty(data)) {
      const selectedYearData = _.get(data, ergDataState.viewingYear);
      const monthData: TrendDataIF[] = englishMonths.map((month) => {
        return {
          month: month,
          rowErg: selectedYearData[month]?.rowErg?.workDistanceSum ?? 0,
          bikeErg: selectedYearData[month]?.bikeErg?.workDistanceSum ?? 0,
          skiErg: selectedYearData[month]?.skiErg?.workDistanceSum ?? 0,
          stat: "distance",
        };
      });
      setAggregatedDistanceData(monthData);
    }
  }, [data, ergDataState.viewingYear]);

  if (!data || _.isEmpty(data)) return null;

  return (
    <Grid>
      <Grid.Col span={12}>
        <BarChartComponent
          title={""}
          data={aggregatedDistanceData!}
          hexFill={getColorForErgType("rowErg")}
          tickFormatter={getFormattedDistanceString}
        />
      </Grid.Col>
    </Grid>
  );
};
