import { Flex } from "@mantine/core";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { TrendTooltip } from "./TrendTooltip.component.tsx";
import { TrendDataIF } from "../../types/types.ts";

interface BarChartComponentIF {
  title: string;
  data: TrendDataIF[];
  hexFill: string;
  tickFormatter: (item: number | string | undefined) => string;
}

export const BarChartComponent: React.FC<BarChartComponentIF> = ({
  title,
  data,
  tickFormatter,
}) => {
  const firstLetter = (monthName: string) => {
    return monthName[0];
  };

  return (
    <>
      <h3>{title}</h3>
      <Flex
        mih={100}
        gap="md"
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="wrap"
      >
        <BarChart
          width={750}
          height={600}
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 30,
            bottom: 1,
          }}
        >
          <XAxis dataKey="month" tickFormatter={firstLetter} />
          <YAxis dataKey="" tickFormatter={tickFormatter} />
          <Tooltip content={<TrendTooltip />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="left" />
          <Bar dataKey="rowErg" name="RowErg" stackId="a" fill="#afbd22" />
          <Bar dataKey="bikeErg" name="BikeErg" stackId="a" fill="#9dc7f5" />
          <Bar dataKey="skiErg" name="SkiErg" stackId="a" fill="#ffffff" />
        </BarChart>
      </Flex>
    </>
  );
};
