import { Flex } from "@mantine/core";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { TrendTooltip } from "./TrendTooltip.component.tsx";
import { TrendDataIF } from "../../types/types.ts";

interface BarChartComponentIF {
  title: string;
  data: TrendDataIF[];
  dataKey: string;
  hexFill: string;
  tickFormatter: (item: number | string | undefined) => string;
}

export const BarChartComponent: React.FC<BarChartComponentIF> = ({
  title,
  data,
  dataKey,
  hexFill,
  tickFormatter,
}) => {
  const firstLetter = (monthName: string) => {
    return monthName[0];
  };
  const ergType = "rowErg";

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
          width={650}
          height={500}
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 0,
          }}
        >
          <XAxis dataKey="month" tickFormatter={firstLetter} />
          <YAxis dataKey={dataKey} tickFormatter={tickFormatter} />
          <Tooltip content={<TrendTooltip />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="left" />
          <Bar
            dataKey={dataKey}
            name={`${ergType} meters`}
            fill={hexFill}
            activeBar={<Rectangle fill="#7f99b2" stroke="#ffffff" />}
          />
        </BarChart>
      </Flex>
    </>
  );
};
