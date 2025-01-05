import { Grid, Radio, RadioGroup } from "@mantine/core";
import { BarChartComponent } from "./BarChart.component.tsx";
import { getFormattedDistanceString } from "../../services/formatting_utils.ts";
import { useEffect, useState } from "react";
import { ErgDataByYear, ErgType, TrendDataIF } from "../../types/types.ts";
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
  const [chartErgType, setChartErgType] = useState<ErgType>("rowErg");
  const [aggregatedDistanceData, setAggregatedDistanceData] =
    useState<TrendDataIF[]>();

  useEffect(() => {
    if (data && !_.isEmpty(data)) {
      const selectedYearData = _.get(data, ergDataState.viewingYear);
      const monthData: TrendDataIF[] = englishMonths.map((month) => {
        return {
          month: month,
          value: selectedYearData[month]?.[chartErgType]?.workDistanceSum ?? 0,
          ergType: chartErgType,
          stat: "distance",
        };
      });
      setAggregatedDistanceData(monthData);
    }
  }, [data, chartErgType, ergDataState.viewingYear]);

  if (!data || _.isEmpty(data)) return null;

  const handleChartErgTypeRadio = (e: string) => {
    setChartErgType(e as ErgType);
  };

  return (
    <Grid>
      <Grid.Col span={9}>
        <BarChartComponent
          title={"Distance"}
          data={aggregatedDistanceData!}
          dataKey={"value"}
          hexFill={getColorForErgType(chartErgType)}
          tickFormatter={getFormattedDistanceString}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <RadioGroup value={chartErgType} onChange={handleChartErgTypeRadio}>
          <Radio
            disabled={!ergDataState.hasRowErg}
            value="rowErg"
            label="RowErg"
            className={"pad-bottom"}
          />
          <Radio
            disabled={!ergDataState.hasBikeErg}
            value="bikeErg"
            label="BikeErg"
            className={"pad-bottom"}
          />
          <Radio
            disabled={!ergDataState.hasSkiErg}
            value="skiErg"
            label="SkiErg"
            className={"pad-bottom"}
          />
        </RadioGroup>
      </Grid.Col>
    </Grid>
  );
};
