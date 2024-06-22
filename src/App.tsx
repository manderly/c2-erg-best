import {useState, useEffect} from 'react';
import './App.css'
import '@mantine/core/styles.css';
import {Checkbox, Divider, FileInput, MantineProvider, NativeSelect, Radio, RadioGroup} from '@mantine/core';
import { Grid, Chip, Button, Flex } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {isAfter, isBefore, subDays} from 'date-fns';
import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { useForm } from 'react-hook-form';
import Papa from 'papaparse';
import {ColDef, GridOptions, ICellRendererParams} from 'ag-grid-community';
import _ from 'lodash';
import {
  formatMillisecondsToTimestamp,
  getFormattedDate,
  getFormattedDistance, getFormattedDistanceString,
  getFormattedDuration,
  getFormattedTime,
  getMonthNumber, getRowYear, parseTimeToMilliseconds
} from "./services/formatting_utils";
import {MonthCards} from "./components/MonthCards";
import {BestDataIF, RowIF, WorkoutDataType, DisplayRowType, ErgType} from "./types/types.ts";
import {BarChartComponent} from "./components/BarChartComponent.tsx";
import {BIKE_ERG_COLOR, ROW_ERG_COLOR, SKI_ERG_COLOR} from "./consts/consts.ts";

const csvFile = '/concept2-season-2024.csv';

interface ParsedCSVRowDataIF {
  dateRaw: string;
  date: string;
  startTime: string;
  type: ErgType;
  description: string;
  pace: string;
  workTime: string;
  restTime: string;
  workDistance: number;
  restDistance: number;
  strokeRate: number;
  strokeCount: number;
  totalCal: string;
  avgHeartRate: number;
  dragFactor: number;
  ranked: boolean;
  id: string;
}

interface MonthDataIF {
  name: string,
  year: number,
  rowErg: BestDataIF,
  bikeErg: BestDataIF,
  skiErg: BestDataIF,
}
type Months = "January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December";
type LocalBests = {
  [key in Months]?: MonthDataIF;
};


interface ResultsIF {
  data: [];
}

interface DateAndDistanceIF {
  date: string;
  distance: number;
}

interface DateAndPaceIF {
  date: string,
  pace: number
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


const ergTypeCellRenderer = (params: ICellRendererParams) => {
  return <>{params.data.type.charAt(0).toUpperCase() + params.data.type.slice(1)}</>;
}

const distanceCellRenderer = (params: ICellRendererParams<RowIF>) => {
  return getFormattedDistanceString(params['valueFormatted']);
}

const numberCellRenderer = (params: ICellRendererParams<RowIF>) => {
  const value = Number(params['value']);
  if (value > 0) {
    return <>{value.toLocaleString()}</>
  } else {
    return <>--</>
  }
}

const ALL_COLUMNS = [
  {field: 'date', flex: 3.2},
  {field: 'startTime', flex: 2.5},
  {field: 'type', flex: 2, cellRenderer: ergTypeCellRenderer},
  {field: 'description', flex: 3},
  {field: 'pace', flex: 3},
  {
    headerName: "Workout Time",
    children: [
      {
        field: 'workTime',
        flex: 2.5,
        headerName: 'Work',
        type: 'rightAligned'
      },
      {
        field: 'restTime',
        flex: 2.5,
        headerName: 'Rest',
        type: 'rightAligned',
      },
    ],
  },
  {
    headerName: 'Distance',
    children: [
      {
        field: 'workDistance',
        flex: 2.5,
        headerName: 'Work',
        type: 'rightAligned',
        cellRenderer: distanceCellRenderer
      },
      {
        field: 'restDistance',
        flex: 2.5,
        headerName: 'Rest',
        type: 'rightAligned',
        cellRenderer: distanceCellRenderer
      },
    ]
  },
  {
    headerName: 'Stroke',
    children: [
      {
        field: 'strokeRate',
        flex: 1.5,
        headerName: 'Rate',
        type: 'rightAligned',
      },
      {
        field: 'strokeCount',
        flex: 1.5,
        headerName: 'Count',
        type: 'rightAligned',
        cellRenderer: numberCellRenderer
      },
    ]
  },
  {field: 'totalCal', flex: 1},
  {headerName: '♥', field: 'avgHeartRate', flex: 1},
  {field: 'dragFactor', flex: 1},
  {field: 'ranked', flex: 1},
];

const DEFAULT_RECORD_DATA: BestDataIF = {
  bestDistance: {
    value: 0,
    date: '',
    workoutId: '',
  },
  bestPace: {
    value: '999:00.0',
    date: '',
    workoutId: '',
  },
  bestStroke: {
    value: 0,
    date: '',
    workoutId: '',
  },
};

function App() {
  const DATE_FORMAT = "MMM D, YYYY";
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

  const getFilteredRows = () => {
    const copy = _.cloneDeep(unfilteredRowData);
    if (copy && copy.length) {
      return copy.filter((row: DisplayRowType) => {
        if (!includeBike && row.type === 'bikeErg') {
          return;
        }
        if (!includeRower && row.type === 'rowErg') {
          return;
        }
        if (!includeSki && row.type === 'skiErg') {
          return;
        }

        // ignore any row that is outside the date range
        if (isBefore(new Date(row.date), new Date(startDate)) || isAfter(new Date(row.date), new Date(endDate))) {
          return;
        }

        return row;
      })
    }
  }

  const getFilteredColumns = () => {
    return ALL_COLUMNS.filter((col: ColDef ) => {
      if (col.field === 'startTime' && includeStartTime) {
        return col;
      } else if (col.field === 'startTime' && !includeStartTime) {
        return;
      }

      if (col.field === 'totalCal' && includeTotalCal) {
        return col;
      } else if (col.field === 'totalCal' && !includeTotalCal) {
        return;
      }

      if (col.field === 'ranked' && includeRanked) {
        return col;
      } else if (col.field === 'ranked' && !includeRanked) {
        return;
      }

      if (col.field === 'dragFactor' && includeDragFactor) {
        return col;
      } else if (col.field === 'dragFactor' && !includeDragFactor) {
        return;
      }

      return col;
    })
  }

  const {  handleSubmit } = useForm();
  const [file, setFile] = useState<File | null>(null);

  const [startDate, setStartDate] = useState(subDays(new Date(), 120));
  const [endDate, setEndDate] = useState(new Date());
  const [minimumDuration, setMinimumDuration] = useState('60');

  const [hasRowErg, setHasRowErg] = useState(false);
  const [hasBikeErg, setHasBikeErg] = useState(false);
  const [hasSkiErg, setHasSkiErg] = useState(false);

  const [includeRower, setIncludeRower] = useState(true);
  const [includeBike, setIncludeBike] = useState(true);
  const [includeSki, setIncludeSki] = useState(true);
  const [includeStartTime, setIncludeStartTime] = useState(false);
  const [includeTotalCal, setIncludeTotalCal] = useState(false);
  const [includeRanked, setIncludeRanked] = useState(false);
  const [includeDragFactor, setIncludeDragFactor] = useState(false);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState<ColDef[]>(getFilteredColumns());
  const [unfilteredRowData, setUnfilteredRowData] = useState<ParsedCSVRowDataIF[]>([]);
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [bests, setBests] = useState({});

  const [distanceTrendsRow, setDistanceTrendsRow] = useState<DateAndDistanceIF[]>([]);
  const [distanceTrendsBike, setDistanceTrendsBike] = useState<DateAndDistanceIF[]>([]);

  const [paceTrendsRow, setPaceTrendsRow] = useState<DateAndPaceIF[]>([]);
  const [paceTrendsBike, setPaceTrendsBike] = useState<DateAndPaceIF[]>([]);

  const [chartErgType, setChartErgType] = useState("rowErg");

  const getData = () => {
    parseCSVIntoChartData(fetchLocalCSVFile())
  }

  useEffect(() => {
    void getData();
  }, []);

  useEffect(() => {
    setColDefs(getFilteredColumns());
  }, [includeStartTime, includeTotalCal, includeRanked, includeDragFactor])

  useEffect(() => {
    setFilteredRowData(getFilteredRows());
  }, [unfilteredRowData, includeBike, includeRower, startDate, endDate])

  const fetchLocalCSVFile = async () => {
    try {
      const response = await fetch(csvFile);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported or response body is null');
      }

      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value);
      return csv;
    } catch(e) {
      console.log(e);
    }
  }

  const handleCSVInput = (payload: File | null) => {
    setFile(payload);
  }

  const handleChartErgTypeRadio = (e: string) => {
    setChartErgType(e);
  }

  const updateUsersErgEquipmentTypes = (ergType: string) => {
    if (!hasRowErg && ergType === 'rowErg') {
      setHasRowErg(true);
    }

    if (!hasBikeErg && ergType === 'bikeErg') {
      setHasBikeErg(true);
    }

    if (!hasSkiErg && ergType === 'skiErg') {
      setHasSkiErg(true);
    }
  }

  const parseCSVIntoChartData = (csvFile: Promise<string | undefined>) => {
    Papa.parse(csvFile, {
      complete: function(results: ResultsIF) {
        results.data.shift();
        const localDistanceTrendsRow: DateAndDistanceIF[] = [];
        const localPaceTrendsRow: DateAndPaceIF[] = [];

        const localDistanceTrendsBike: DateAndDistanceIF[] = [];
        const localPaceTrendsBike: DateAndPaceIF[] = [];

        const localBests: LocalBests = {};

        // get all the row data line by line from the csv
        const allRowData: ParsedCSVRowDataIF[] = _.chain(results.data)
          .filter((row: (string|number)[]) => row.length > 1)
          .orderBy((row: (string|number)[]) => row[1]) // date
          .map((row: (string|number)[]) => {
            const ergType = String(row[19]).charAt(0).toLowerCase() + String(row[19]).slice(1) as "bikeErg" | "rowErg" | "skiErg";
            updateUsersErgEquipmentTypes(ergType);

            // rowData from the CSV
            const parsedCSVRowData: ParsedCSVRowDataIF = {
              dateRaw: String(row[1]),
              date: getFormattedDate(String(row[1])),
              startTime: getFormattedTime(String(row[1])),
              type: ergType as ErgType,
              description: String(row[2]),
              pace: String(row[11]), // example: 2:37.4
              workTime: getFormattedDuration(Number(row[4])),
              restTime: getFormattedDuration(Number(row[6])),
              workDistance: getFormattedDistance(row[7] as string),
              restDistance: getFormattedDistance(row[8] as string),
              strokeRate: Number(row[9]),
              strokeCount: Number(row[10]),
              totalCal: `${row[14]} (${row[13]} cal/hr)`,
              avgHeartRate: Number(row[15]),
              dragFactor: Number(row[16]),
              ranked: Boolean(row[20]),
              id: String(row[0]),
            }

            // build "bests" data object
            const monthIdx = getMonthNumber(parsedCSVRowData.date)-1;
            const monthName = MONTH_NAMES[monthIdx];

            // there is no data for this month - create it
            if (localBests[monthName] === undefined) {
              localBests[monthName] = {
                name: monthName,
                year: getRowYear(parsedCSVRowData.date),
                rowErg: _.cloneDeep(DEFAULT_RECORD_DATA),
                bikeErg: _.cloneDeep(DEFAULT_RECORD_DATA),
                skiErg: _.cloneDeep(DEFAULT_RECORD_DATA),
              } as const;
            }

            const localErgType = localBests?.[monthName]?.[ergType];
            if (localErgType) {
              // Update best distance, if better
              if (parsedCSVRowData.workDistance > Number(localErgType.bestDistance.value ?? 0)) {
                localErgType.bestDistance.value = parsedCSVRowData.workDistance;
                localErgType.bestDistance.date = parsedCSVRowData.date;
                localErgType.bestDistance.workoutId = parsedCSVRowData.id;
              }

              // Update best pace, if better
              if (parseTimeToMilliseconds(parsedCSVRowData.pace) < parseTimeToMilliseconds(String(localErgType.bestPace.value))) {
                localErgType.bestPace.value = parsedCSVRowData.pace;
                localErgType.bestPace.date = parsedCSVRowData.date;
                localErgType.bestPace.workoutId = parsedCSVRowData.id;
              }

              // Update best strokeRate, if better
              if (parsedCSVRowData.strokeRate > Number(localErgType.bestStroke.value)) {
                localErgType.bestStroke.value = parsedCSVRowData.strokeRate;
                localErgType.bestStroke.date = parsedCSVRowData.date;
                localErgType.bestStroke.workoutId = parsedCSVRowData.id;
              }
            }

            // add to "distanceTrends" object
            const newDistance: {date: string, distance: number} = {
              date: parsedCSVRowData.date,
              distance: parsedCSVRowData.workDistance,
            }
            if (ergType==='rowErg') {
              localDistanceTrendsRow.push(newDistance);
            } else {
              localDistanceTrendsBike.push(newDistance);
            }

            // add to "paceTrends" object
            const newPace: {date: string, pace: number} = {
              date: parsedCSVRowData.date,
              pace: parseTimeToMilliseconds(parsedCSVRowData.pace),
            }
            if (ergType==='rowErg') {
              localPaceTrendsRow.push(newPace);
            } else {
              localPaceTrendsBike.push(newPace);
            }

            return parsedCSVRowData;
        }).value();

        setBests(localBests);
        setDistanceTrendsRow(localDistanceTrendsRow);
        setDistanceTrendsBike(localDistanceTrendsBike);
        setPaceTrendsRow(localPaceTrendsRow);
        setPaceTrendsBike(localPaceTrendsBike);
        setUnfilteredRowData(allRowData);
      }
    });
  }

  const UploadFile = () => (
    <form onSubmit={parseCSVIntoChartData}>
      <Flex
        className={"upload-file pad-bottom pad-right"}
        mih={90}
        gap="md"
        justify="flex-end"
        align="flex-end"
        direction="row"
        wrap="wrap">
        <FileInput
          label="Upload Concept2 CSV data"
          description="Download from official site"
          placeholder={file ? file['name'] : "Click to choose .csv file"}
          accept="csv"
          onChange={handleCSVInput}
          clearable
        />
        <Button type={"submit"} disabled={!file}>Upload</Button>
      </Flex>
    </form>
  );

  const SearchFilters = () => (
    <>
    <h2 className={'main-page-title'}>Filter data</h2>
      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="wrap"
      >
        <Chip
          checked={includeRower && hasRowErg}
          disabled={!hasRowErg}
          onChange={() => setIncludeRower((v) => !v)}>
          RowErg
        </Chip>

        <Chip checked={includeBike && hasBikeErg} disabled={!hasBikeErg} onChange={() => setIncludeBike(v => !v)}>
            BikeErg
        </Chip>

        <Chip checked={includeSki && hasSkiErg} disabled={!hasSkiErg} onChange={() => setIncludeSki(v => !v)}>
            SkiErg
        </Chip>
      </Flex>

      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        wrap="wrap"
        className={"filter-data"}
      >
        <form onSubmit={handleSubmit(_.noop)}>
          <DateInput value={startDate} onChange={() => setStartDate} label={"Start"} valueFormat={DATE_FORMAT}/>
          <DateInput value={endDate} onChange={() => setEndDate} label={"End"} valueFormat={DATE_FORMAT}/>

          <NativeSelect
            label={"Exclude workouts shorter than..."}
            value={minimumDuration}
            onChange={(event) => setMinimumDuration(event.currentTarget.value)}
            data={[
              { label: '30 seconds', value: '30' },
              { label: '1 minute', value: '60' },
              { label: '5 minutes', value: '300' },
              { label: '10 minutes', value: '600' },
            ]}
          />
        </form>
      </Flex>

      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        wrap="wrap"
        className={"filter-data"}
      >
        <Checkbox checked={includeStartTime} label={"Include start time"} onChange={() => setIncludeStartTime(prev => !prev)}/>
        <Checkbox checked={includeTotalCal} label={"Include calories"} onChange={() => setIncludeTotalCal(prev => !prev)}/>
        <Checkbox checked={includeRanked} label={"Include ranked"} onChange={() => setIncludeRanked(prev => !prev)}/>
        <Checkbox checked={includeDragFactor} label={"Include drag factor"} onChange={() => setIncludeDragFactor(prev => !prev)}/>
      </Flex>
    </>
  );

  const gridOptions: GridOptions = {
    getRowStyle: getRowStyleErgType
  }

  function getRowStyleErgType(item: WorkoutDataType) {
    if (item.data.type === 'rowErg') {
      return {
        'backgroundColor': '#6E751F',
        'color': '#F4F8F5'
      }
    } else if (item.data.type === 'bikeErg') {
      return {
        'backgroundColor': '#003A70',
        'color': '#F4F8F5'
      };
    }
    return null;
  }

  const ResultsTable = () => (
    <>
      <div
        className="ag-theme-quartz" // applying the grid theme
        style={{ height: 600 }} // expand grid to fit parent container
      >
        <AgGridReact
          rowData={filteredRowData}
          columnDefs={colDefs}
          gridOptions={gridOptions}
        />
      </div>
    </>
  );

  return (
    <MantineProvider defaultColorScheme="dark">
      <div className={"app-container"}>

        <Grid className={"pad-left pad-right"}>
          <Grid.Col span={12}>
            <Flex justify="space-between" className={"pad-top"}>
              <h2 className={"app-title"}>C2 Erg Bests</h2>
              <UploadFile/>
            </Flex>
            <Divider/>

            {filteredRowData &&
                <p>You completed {unfilteredRowData.length} workouts this season 🥇</p>
            }

            <Flex
              mih={600}
              gap="sm"
              justify="flex-start"
              align="space-between"
              direction="row"
              wrap="wrap"
            >
              <MonthCards bests={bests} hasRowErg={hasRowErg} hasBikeErg={hasBikeErg} hasSkiErg={hasSkiErg}/>
            </Flex>

            <br/>
            <h2 className={'main-page-title'}>Trends ({chartErgType})</h2>
            <RadioGroup value={chartErgType} onChange={handleChartErgTypeRadio}>
              {hasRowErg && <Radio value="rowErg" label="RowErg" className={"mb-10"}/>}
              {hasBikeErg && <Radio value="bikeErg" label="BikeErg" className={"mb-10"}/>}
              {hasSkiErg && <Radio value="skiErg" label="SkiErg"/>}
            </RadioGroup>

            <BarChartComponent
              title={"Distance"}
              data={chartErgType === 'rowErg' ? distanceTrendsRow : distanceTrendsBike}
              dataKey={"distance"}
              hexFill={getColorForErgType(chartErgType)}
              tickFormatter={getFormattedDistanceString}
            />
            <BarChartComponent
              title={"Pace"}
              data={chartErgType === 'rowErg' ? paceTrendsRow : paceTrendsBike}
              dataKey={"pace"}
              hexFill={getColorForErgType(chartErgType)}
              tickFormatter={formatMillisecondsToTimestamp}
            />

            <SearchFilters/>
            <h2 className={'main-page-title'}>Logbook</h2>
            {filteredRowData &&
                <>Showing {filteredRowData.length} of this season's {unfilteredRowData.length} workouts</>
            }
            <ResultsTable />

          </Grid.Col>
        </Grid>
      </div>

      <div className={"bottom-credits"}>
        App by Mandi Burley, 2024
      </div>
    </MantineProvider>
  )
}

export default App
