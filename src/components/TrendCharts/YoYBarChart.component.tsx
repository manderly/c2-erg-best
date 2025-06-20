import { Flex } from "@mantine/core";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
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
          <YAxis
            dataKey="meters"
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
          <Bar dataKey="meters" name="meters" stackId="a" fill="#afbd22" />
        </BarChart>
      </Flex>
    </>
  );
};
