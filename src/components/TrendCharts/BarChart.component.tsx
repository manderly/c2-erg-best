import {Flex} from "@mantine/core";
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {DateAndPaceIF, DateAndDistanceIF} from "../../types/types.ts";

interface BarChartComponentIF {
  title: string;
  data: DateAndPaceIF[] | DateAndDistanceIF[];
  dataKey: string;
  hexFill: string;
  tickFormatter: (item: number | string | undefined) => string;
}

export const BarChartComponent: React.FC<BarChartComponentIF> = ({title, data, dataKey, hexFill, tickFormatter}) => {
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
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="date"/>
          <YAxis
            dataKey={dataKey}
            tickFormatter={tickFormatter}
          />
          <Tooltip/>
          <Legend/>
          <Bar dataKey={dataKey} fill={hexFill} activeBar={<Rectangle fill="pink" stroke="blue"/>}/>
        </BarChart>
      </Flex>
    </>
  )
};