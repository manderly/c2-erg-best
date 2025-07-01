import React from "react";
import { Flex } from "@mantine/core";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { YoYMetersDataIF } from "../../types/types.ts";
import { YoYTooltip } from "./YoYTooltip.component.tsx";
import { CHART_TICK_COLOR } from "../../consts/consts.ts";

interface YoYBarChartComponentIF {
  title: string;
  data: YoYMetersDataIF[];
  hexFill: string;
  tickFormatter: (item: number | string | undefined) => string;
}

export const YoYBarChartComponent: React.FC<YoYBarChartComponentIF> = ({
  title,
  data,
  tickFormatter,
}) => {
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
          width={600}
          height={360}
          data={data}
          margin={{
            top: 50,
            right: 5,
            left: 30,
            bottom: 1,
          }}
        >
          <CartesianGrid strokeDasharray="1 3" vertical={false} />
          <YAxis
            dataKey=""
            tickFormatter={tickFormatter}
            tick={{ fill: CHART_TICK_COLOR }}
            tickLine={{ stroke: CHART_TICK_COLOR }}
          />
          <XAxis
            dataKey="year"
            tick={{ fill: CHART_TICK_COLOR }}
            tickLine={{ stroke: CHART_TICK_COLOR }}
          />
          <Tooltip content={<YoYTooltip />} />
          <Bar
            dataKey="rowErgMeters"
            name="RowErg"
            stackId="a"
            fill="#afbd22"
          />
          <Bar
            dataKey="bikeErgMeters"
            name="BikeErg"
            stackId="a"
            fill="#9dc7f5"
          />
          <Bar
            dataKey="skiErgMeters"
            name="SkiErg"
            stackId="a"
            fill="#ffffff"
          />
        </BarChart>
      </Flex>
    </>
  );
};
