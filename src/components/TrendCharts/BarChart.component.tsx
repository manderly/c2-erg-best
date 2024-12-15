import { Flex } from "@mantine/core";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendDataGroupedIF } from "../../types/types.ts";
import { englishMonthsAbbreviations } from "../../consts/consts.ts";
import { TrendTooltip } from "./TrendTooltip.component.tsx";

interface BarChartComponentIF {
  title: string;
  data: TrendDataGroupedIF[];
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
  const numberToMonthAbbreviation = (num: number) => {
    return englishMonthsAbbreviations[num - 1];
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
          width={1000}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tickFormatter={numberToMonthAbbreviation} />
          <YAxis dataKey={dataKey} tickFormatter={tickFormatter} />
          <Tooltip content={<TrendTooltip />} />
          <Legend />
          <Bar
            dataKey={dataKey}
            fill={hexFill}
            activeBar={<Rectangle fill="#7f99b2" stroke="#ffffff" />}
          />
        </BarChart>
      </Flex>
    </>
  );
};
